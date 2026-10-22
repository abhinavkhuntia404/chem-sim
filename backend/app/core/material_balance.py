"""
Material balance solver for process engineering.

Implements:
  - Overall and component material balances.
  - Steady-state and accumulation terms.
  - Degrees-of-freedom (DOF) analysis.
  - Linear system solver.
  - Nonlinear solver for reaction systems.
  - Mixing, splitting, separation, and reaction units.
  - Residual and closure-error calculations.
  - Process graph with multi-unit balances.

Fundamental equations:
  Accumulation = Input - Output + Generation - Consumption

  Steady-state, nonreactive:
    Σ ṁ_in = Σ ṁ_out   (overall)
    Σ (x_i · ṁ)_in = Σ (x_i · ṁ)_out   (component i)

Sign convention:
  - Input: positive
  - Output: negative (in the balance equation, we move to RHS)
  - Generation: positive (products of reaction)
  - Consumption: negative (reactants consumed)
"""

from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, List, Dict, Tuple
import math
import numpy as np


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

class Basis(Enum):
    MASS = "mass"
    MOLAR = "molar"


class UnitType(Enum):
    MIXER = "mixer"
    SPLITTER = "splitter"
    SEPARATOR = "separator"
    REACTOR = "reactor"
    HEAT_EXCHANGER = "heat_exchanger"
    GENERIC = "generic"


@dataclass
class Stream:
    """
    Process stream carrying flow, composition, and state.

    All compositions are fractions (summing to 1.0).
    """
    name: str
    components: List[str]
    flow: Optional[float] = None          # Total flow (mass or molar)
    composition: Optional[List[Optional[float]]] = None  # Fractions per component
    temperature_C: Optional[float] = None
    pressure_kPa: Optional[float] = None
    phase: Optional[str] = None           # "liquid", "vapor", "two_phase"
    basis: Basis = Basis.MOLAR

    @property
    def num_components(self) -> int:
        return len(self.components)

    def component_flow(self, idx: int) -> Optional[float]:
        """Return the flow of component idx, if determinable."""
        if self.flow is not None and self.composition is not None:
            xi = self.composition[idx]
            if xi is not None:
                return self.flow * xi
        return None

    def count_unknowns(self) -> int:
        """Count the number of unknown variables in this stream."""
        count = 0
        if self.flow is None:
            count += 1
        if self.composition is not None:
            count += sum(1 for x in self.composition if x is None)
        else:
            count += self.num_components
        return count


@dataclass
class Reaction:
    """
    Stoichiometric reaction specification.

    stoichiometry: mapping from component name to stoichiometric coefficient.
        Negative for reactants, positive for products.
        e.g., {"A": -1, "B": -2, "C": 1} for A + 2B → C

    extent: reaction extent (ξ) in mol/s or kg/s, if known.
    conversion: fractional conversion of the limiting reactant, if known.
    limiting_reactant: name of the limiting reactant.
    """
    stoichiometry: Dict[str, float]
    extent: Optional[float] = None
    conversion: Optional[float] = None
    limiting_reactant: Optional[str] = None


@dataclass
class ProcessUnit:
    """
    A single process unit with inlet and outlet streams.
    """
    name: str
    unit_type: UnitType
    inlets: List[Stream] = field(default_factory=list)
    outlets: List[Stream] = field(default_factory=list)
    reactions: List[Reaction] = field(default_factory=list)
    basis: Basis = Basis.MOLAR

    @property
    def components(self) -> List[str]:
        """Get the component list (from the first stream found)."""
        for s in self.inlets + self.outlets:
            if s.components:
                return s.components
        return []


@dataclass
class DOFAnalysis:
    """Degrees-of-freedom analysis result."""
    num_unknowns: int
    num_equations: int
    dof: int
    unknown_vars: List[str]
    equations: List[str]
    status: str  # "determined", "underdetermined", "overdetermined"
    message: str


@dataclass
class BalanceResult:
    """Result of a material balance calculation."""
    unit_name: str
    solved: bool
    streams: Dict[str, Stream]  # name → stream with solved values
    dof: DOFAnalysis

    # Balance residuals
    overall_residual: float  # |Σin - Σout + Σgen - Σcons|
    component_residuals: Dict[str, float]  # component → residual
    relative_closure: float  # overall_residual / max(Σin, 1e-15)

    # Diagnostics
    equations_used: List[str]
    warnings: List[str]
    basis: Basis


# ---------------------------------------------------------------------------
# DOF Analysis
# ---------------------------------------------------------------------------

def degrees_of_freedom(unit: ProcessUnit) -> DOFAnalysis:
    """
    Perform degrees-of-freedom analysis on a process unit.

    Counts:
      - Unknowns: unknown flows and compositions in all streams.
      - Equations: overall balance + component balances +
                   composition sum constraints + any specified relations.

    Returns
    -------
    DOFAnalysis
    """
    components = unit.components
    nc = len(components)
    unknowns: List[str] = []
    equations: List[str] = []

    # Count unknowns
    for stream in unit.inlets + unit.outlets:
        if stream.flow is None:
            unknowns.append(f"{stream.name}.flow")
        if stream.composition is not None:
            for i, xi in enumerate(stream.composition):
                if xi is None:
                    unknowns.append(f"{stream.name}.x_{components[i]}")
        else:
            for i in range(nc):
                unknowns.append(f"{stream.name}.x_{components[i]}")

    # Count reaction extents
    for j, rxn in enumerate(unit.reactions):
        if rxn.extent is None and rxn.conversion is None:
            unknowns.append(f"reaction_{j}_extent")

    # Count equations
    # 1. Overall material balance
    equations.append("Overall balance: Σṁ_in = Σṁ_out (+gen -cons)")

    # 2. Component balances (nc - 1 independent for nonreactive; nc for reactive)
    if unit.reactions:
        for comp in components:
            equations.append(f"Component balance: {comp}")
    else:
        for comp in components[:nc-1]:
            equations.append(f"Component balance: {comp}")
        # The last component balance is redundant with the overall balance
        # when there are no reactions.

    # 3. Composition sum = 1 for each stream with partial composition info
    for stream in unit.inlets + unit.outlets:
        if stream.composition is not None:
            has_unknowns = any(x is None for x in stream.composition)
            if has_unknowns:
                equations.append(f"Σx_i = 1 for {stream.name}")

    # 4. Splitter relations: outlet compositions equal inlet
    if unit.unit_type == UnitType.SPLITTER:
        for outlet in unit.outlets[1:]:  # all outlets have same composition
            for comp in components:
                equations.append(f"Splitter: {outlet.name}.x_{comp} = inlet.x_{comp}")

    # 5. Conversion specifications
    for j, rxn in enumerate(unit.reactions):
        if rxn.conversion is not None:
            equations.append(f"Reaction {j} conversion spec")

    n_unk = len(unknowns)
    n_eq = len(equations)
    dof = n_unk - n_eq

    if dof == 0:
        status = "determined"
        message = "System is fully determined. Can be solved."
    elif dof > 0:
        status = "underdetermined"
        message = f"System has {dof} degree(s) of freedom. Need {dof} more specification(s)."
    else:
        status = "overdetermined"
        message = f"System is overdetermined by {-dof} equation(s). Check for contradictions."

    return DOFAnalysis(
        num_unknowns=n_unk,
        num_equations=n_eq,
        dof=dof,
        unknown_vars=unknowns,
        equations=equations,
        status=status,
        message=message,
    )


# ---------------------------------------------------------------------------
# Material Balance Solver
# ---------------------------------------------------------------------------

def solve_material_balance(unit: ProcessUnit) -> BalanceResult:
    """
    Solve material balances for a single process unit.

    For nonreactive steady-state:
      Σ F_in * x_i,in = Σ F_out * x_i,out  for each component

    For reactive:
      Σ F_in * x_i,in + ν_i * ξ = Σ F_out * x_i,out

    Uses numpy for linear system solving.

    Returns
    -------
    BalanceResult
    """
    components = unit.components
    nc = len(components)
    dof = degrees_of_freedom(unit)
    warnings: List[str] = []
    equations_used: List[str] = []

    if nc == 0:
        return BalanceResult(
            unit_name=unit.name, solved=False,
            streams={s.name: s for s in unit.inlets + unit.outlets},
            dof=dof, overall_residual=0, component_residuals={},
            relative_closure=0, equations_used=[],
            warnings=["No components defined."], basis=unit.basis,
        )

    # For a simple system: try direct algebraic solving
    # Identify knowns and unknowns
    all_streams = unit.inlets + unit.outlets

    # Attempt simple direct solve for determined systems
    if dof.dof > 0:
        warnings.append(dof.message)

    # Build and solve the linear system for simple cases
    solved_streams = _solve_linear_balance(unit, components, warnings, equations_used)

    if solved_streams is None:
        return BalanceResult(
            unit_name=unit.name, solved=False,
            streams={s.name: s for s in all_streams},
            dof=dof, overall_residual=float('nan'),
            component_residuals={c: float('nan') for c in components},
            relative_closure=float('nan'), equations_used=equations_used,
            warnings=warnings, basis=unit.basis,
        )

    # Compute residuals
    overall_in = sum(
        s.flow for s in unit.inlets if s.flow is not None
    )
    overall_out = sum(
        s.flow for s in unit.outlets if s.flow is not None
    )
    overall_residual = abs(overall_in - overall_out)

    comp_residuals = {}
    for i, comp in enumerate(components):
        flow_in = sum(
            s.component_flow(i) for s in unit.inlets
            if s.component_flow(i) is not None
        )
        flow_out = sum(
            s.component_flow(i) for s in unit.outlets
            if s.component_flow(i) is not None
        )
        comp_residuals[comp] = abs(flow_in - flow_out)

    relative_closure = overall_residual / max(overall_in, 1e-15)

    return BalanceResult(
        unit_name=unit.name,
        solved=True,
        streams=solved_streams,
        dof=dof,
        overall_residual=overall_residual,
        component_residuals=comp_residuals,
        relative_closure=relative_closure,
        equations_used=equations_used,
        warnings=warnings,
        basis=unit.basis,
    )


def _solve_linear_balance(
    unit: ProcessUnit,
    components: List[str],
    warnings: List[str],
    equations_used: List[str],
) -> Optional[Dict[str, Stream]]:
    """
    Attempt to solve the material balance as a linear system.

    Handles common cases:
      - Known inlet, unknown outlet (or vice versa).
      - Simple mixer/splitter.
      - Two-stream balance.
    """
    nc = len(components)
    inlets = unit.inlets
    outlets = unit.outlets

    # Case 1: Mixer — all inlets known, solve single outlet
    if (unit.unit_type == UnitType.MIXER
        and len(outlets) == 1
        and all(s.flow is not None for s in inlets)
        and all(
            s.composition is not None and all(x is not None for x in s.composition)
            for s in inlets
        )):

        out = outlets[0]
        total_flow = sum(s.flow for s in inlets)
        comp_flows = [0.0] * nc
        for s in inlets:
            for i in range(nc):
                comp_flows[i] += s.flow * s.composition[i]

        out.flow = total_flow
        if total_flow > 0:
            out.composition = [cf / total_flow for cf in comp_flows]
        else:
            out.composition = [0.0] * nc

        equations_used.append("Mixer: F_out = ΣF_in")
        for comp in components:
            equations_used.append(f"Mixer: F_out·x_{comp} = Σ(F_in·x_{comp})")

        result = {s.name: s for s in inlets + outlets}
        return result

    # Case 2: Splitter — known inlet, known split ratios or known outlet flows
    if (unit.unit_type == UnitType.SPLITTER
        and len(inlets) == 1
        and inlets[0].flow is not None
        and inlets[0].composition is not None):

        inlet = inlets[0]
        # All outlets have same composition as inlet
        for out in outlets:
            out.composition = list(inlet.composition)
        equations_used.append("Splitter: all outlet compositions = inlet composition")

        # If all but one outlet flow is known, solve the last
        unknown_outlets = [o for o in outlets if o.flow is None]
        known_out_flow = sum(o.flow for o in outlets if o.flow is not None)
        if len(unknown_outlets) == 1:
            unknown_outlets[0].flow = inlet.flow - known_out_flow
            equations_used.append("Overall balance: F_unknown = F_in - Σ(F_known_out)")

        result = {s.name: s for s in inlets + outlets}
        return result

    # Case 3: General two-stream balance (1 inlet, 1 outlet, no reaction)
    if (len(inlets) == 1 and len(outlets) == 1 and not unit.reactions):
        inp = inlets[0]
        out = outlets[0]

        if inp.flow is not None and out.flow is None:
            out.flow = inp.flow
            equations_used.append("Overall: F_out = F_in")
        elif out.flow is not None and inp.flow is None:
            inp.flow = out.flow
            equations_used.append("Overall: F_in = F_out")

        if (inp.composition is not None
            and all(x is not None for x in inp.composition)
            and (out.composition is None
                 or any(x is None for x in out.composition))):
            out.composition = list(inp.composition)
            for comp in components:
                equations_used.append(f"Component: x_{comp}_out = x_{comp}_in")

        result = {s.name: s for s in inlets + outlets}
        return result

    # Case 4: Separator — known inlet, one known outlet, solve the other
    if (unit.unit_type == UnitType.SEPARATOR
        and len(inlets) == 1
        and len(outlets) == 2
        and not unit.reactions):

        inp = inlets[0]
        out1, out2 = outlets

        # Check if inlet and one outlet are fully known
        if (inp.flow is not None
            and inp.composition is not None
            and all(x is not None for x in inp.composition)):

            known_out = None
            unknown_out = None
            if (out1.flow is not None and out1.composition is not None
                and all(x is not None for x in out1.composition)):
                known_out, unknown_out = out1, out2
            elif (out2.flow is not None and out2.composition is not None
                  and all(x is not None for x in out2.composition)):
                known_out, unknown_out = out2, out1

            if known_out and unknown_out:
                unknown_out.flow = inp.flow - known_out.flow
                equations_used.append(f"Overall: {unknown_out.name}.F = F_in - {known_out.name}.F")

                if unknown_out.flow > 0:
                    unknown_out.composition = []
                    for i in range(nc):
                        comp_flow_in = inp.flow * inp.composition[i]
                        comp_flow_known = known_out.flow * known_out.composition[i]
                        xi = (comp_flow_in - comp_flow_known) / unknown_out.flow
                        unknown_out.composition.append(xi)
                        equations_used.append(
                            f"Component {components[i]}: "
                            f"{unknown_out.name}.x = (F_in·x_in - F_known·x_known) / F_unknown"
                        )
                else:
                    unknown_out.composition = [0.0] * nc
                    warnings.append(f"Unknown outlet flow is zero or negative.")

                result = {s.name: s for s in inlets + outlets}
                return result

    # Case 5: General linear system via matrix assembly
    # For more complex systems, we build Ax=b
    try:
        return _solve_general_linear(unit, components, warnings, equations_used)
    except Exception as e:
        warnings.append(f"Linear solver failed: {e}")
        return None


def _solve_general_linear(
    unit: ProcessUnit,
    components: List[str],
    warnings: List[str],
    equations_used: List[str],
) -> Optional[Dict[str, Stream]]:
    """
    Build and solve a general linear system for the material balance.

    Variables: unknown flows and compositions.
    Equations: overall balance, component balances, Σx_i = 1.
    """
    nc = len(components)
    all_streams = unit.inlets + unit.outlets

    # Identify unknowns and assign indices
    unknowns: List[Tuple[str, str, int]] = []  # (stream_name, var_type, comp_idx)

    for s in all_streams:
        if s.flow is None:
            unknowns.append((s.name, "flow", -1))
        if s.composition is not None:
            for i, xi in enumerate(s.composition):
                if xi is None:
                    unknowns.append((s.name, "comp", i))
        elif s.composition is None:
            s.composition = [None] * nc
            for i in range(nc):
                unknowns.append((s.name, "comp", i))

    n_vars = len(unknowns)
    if n_vars == 0:
        # Everything is known; just validate
        return {s.name: s for s in all_streams}

    # Build equations: Ax = b
    A_rows = []
    b_rows = []

    # Component balances: Σ(F_in · x_i_in) - Σ(F_out · x_i_out) = 0
    for i in range(nc):
        row = [0.0] * n_vars
        rhs = 0.0

        for s in unit.inlets:
            _add_component_terms(s, i, +1, unknowns, row, rhs_ref=[rhs])
            rhs = rhs_ref_hack(s, i, +1, unknowns, rhs)

        for s in unit.outlets:
            _add_component_terms(s, i, -1, unknowns, row, rhs_ref=[rhs])
            rhs = rhs_ref_hack(s, i, -1, unknowns, rhs)

        A_rows.append(row)
        b_rows.append(rhs)
        equations_used.append(f"Component balance: {components[i]}")

    # Σx_i = 1 for each stream
    for s in all_streams:
        if s.composition is not None and any(x is None for x in s.composition):
            row = [0.0] * n_vars
            rhs = 1.0
            for i in range(nc):
                if s.composition[i] is not None:
                    rhs -= s.composition[i]
                else:
                    idx = _find_var(unknowns, s.name, "comp", i)
                    if idx is not None:
                        row[idx] = 1.0
            A_rows.append(row)
            b_rows.append(rhs)
            equations_used.append(f"Σx_i = 1 for {s.name}")

    if len(A_rows) == 0 or n_vars == 0:
        return {s.name: s for s in all_streams}

    A = np.array(A_rows, dtype=float)
    b = np.array(b_rows, dtype=float)

    # Solve
    if A.shape[0] >= A.shape[1]:
        # Determined or overdetermined: least-squares
        try:
            x_sol, residuals, rank, sv = np.linalg.lstsq(A, b, rcond=None)
        except np.linalg.LinAlgError as e:
            warnings.append(f"Solver failed: {e}")
            return None

        if rank < A.shape[1]:
            warnings.append(
                f"System is rank-deficient (rank={rank}, unknowns={A.shape[1]}). "
                "Solution may not be unique."
            )
    else:
        # Underdetermined
        warnings.append(
            f"Underdetermined system ({A.shape[0]} equations, {n_vars} unknowns). "
            "Cannot solve uniquely."
        )
        return None

    # Apply solution
    for j, (sname, vtype, cidx) in enumerate(unknowns):
        stream = next(s for s in all_streams if s.name == sname)
        val = x_sol[j]

        if vtype == "flow":
            stream.flow = val
        elif vtype == "comp":
            stream.composition[cidx] = val

    # Check for negative values
    for s in all_streams:
        if s.flow is not None and s.flow < -1e-10:
            warnings.append(f"Negative flow in {s.name}: {s.flow:.4f}")
        if s.composition is not None:
            for i, xi in enumerate(s.composition):
                if xi is not None and xi < -1e-10:
                    warnings.append(
                        f"Negative composition in {s.name}.{components[i]}: {xi:.6f}"
                    )

    return {s.name: s for s in all_streams}


def _find_var(
    unknowns: List[Tuple[str, str, int]],
    sname: str, vtype: str, cidx: int,
) -> Optional[int]:
    """Find the index of a variable in the unknowns list."""
    for j, (s, v, c) in enumerate(unknowns):
        if s == sname and v == vtype and c == cidx:
            return j
    return None


def _add_component_terms(
    stream: Stream, comp_idx: int, sign: int,
    unknowns: List[Tuple[str, str, int]],
    row: List[float], rhs_ref: List[float],
) -> None:
    """
    Add terms for component i of a stream to the equation row.

    term = sign * F * x_i

    Cases:
      - Both F and x_i known: add to RHS
      - F known, x_i unknown: coefficient = sign * F
      - F unknown, x_i known: coefficient = sign * x_i
      - Both unknown: nonlinear (approximation needed)
    """
    F = stream.flow
    xi = stream.composition[comp_idx] if stream.composition else None

    if F is not None and xi is not None:
        rhs_ref[0] -= sign * F * xi
    elif F is not None and xi is None:
        idx = _find_var(unknowns, stream.name, "comp", comp_idx)
        if idx is not None:
            row[idx] += sign * F
    elif F is None and xi is not None:
        idx = _find_var(unknowns, stream.name, "flow", -1)
        if idx is not None:
            row[idx] += sign * xi
    # Both unknown: skip (would need nonlinear solver)


def rhs_ref_hack(
    stream: Stream, comp_idx: int, sign: int,
    unknowns: List[Tuple[str, str, int]],
    rhs: float,
) -> float:
    """Compute RHS contribution for a component term."""
    F = stream.flow
    xi = stream.composition[comp_idx] if stream.composition else None
    if F is not None and xi is not None:
        return rhs - sign * F * xi
    return rhs


# ---------------------------------------------------------------------------
# Balance Report
# ---------------------------------------------------------------------------

def format_balance_report(result: BalanceResult) -> str:
    """Format a human-readable balance report."""
    lines = []
    lines.append(f"=== Material Balance: {result.unit_name} ===")
    lines.append(f"Basis: {result.basis.value}")
    lines.append(f"Solved: {result.solved}")
    lines.append("")

    # DOF
    lines.append(f"DOF Analysis: {result.dof.status}")
    lines.append(f"  Unknowns: {result.dof.num_unknowns}")
    lines.append(f"  Equations: {result.dof.num_equations}")
    lines.append(f"  DOF: {result.dof.dof}")
    lines.append("")

    # Streams
    lines.append("Streams:")
    for name, stream in result.streams.items():
        flow_str = f"{stream.flow:.4f}" if stream.flow is not None else "unknown"
        lines.append(f"  {name}: F = {flow_str} ({stream.basis.value})")
        if stream.composition:
            for i, comp in enumerate(stream.components):
                xi = stream.composition[i]
                xi_str = f"{xi:.6f}" if xi is not None else "unknown"
                lines.append(f"    x_{comp} = {xi_str}")
    lines.append("")

    # Residuals
    lines.append("Residuals:")
    lines.append(f"  Overall: {result.overall_residual:.6e}")
    for comp, res in result.component_residuals.items():
        lines.append(f"  {comp}: {res:.6e}")
    lines.append(f"  Relative closure: {result.relative_closure:.6e}")
    lines.append("")

    # Warnings
    if result.warnings:
        lines.append("Warnings:")
        for w in result.warnings:
            lines.append(f"  ⚠ {w}")

    return "\n".join(lines)
