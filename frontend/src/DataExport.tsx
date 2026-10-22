import React from 'react';
import { Download } from 'lucide-react';

interface Props {
  data: any;
  filename: string;
  label?: string;
}

export const DataExport: React.FC<Props> = ({ data, filename, label = 'Export Data' }) => {
  const exportJSON = () => {
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', jsonStr);
    dl.setAttribute('download', `${filename}.json`);
    dl.click();
  };

  const exportCSV = () => {
    if (!data) return;
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (Array.isArray(data)) {
      if (data.length === 0) return;
      const headers = Object.keys(data[0]);
      csvContent += headers.join(',') + '\r\n';
      data.forEach((row) => {
        csvContent += headers.map((h) => JSON.stringify(row[h] ?? '')).join(',') + '\r\n';
      });
    } else {
      // Key-value pairs
      csvContent += 'Parameter,Value\r\n';
      Object.entries(data).forEach(([k, v]) => {
        csvContent += `"${k}","${typeof v === 'object' ? JSON.stringify(v) : v}"\r\n`;
      });
    }
    const dl = document.createElement('a');
    dl.setAttribute('href', encodeURI(csvContent));
    dl.setAttribute('download', `${filename}.csv`);
    dl.click();
  };

  return (
    <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
      <button
        onClick={exportJSON}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          padding: '4px 10px',
          borderRadius: 4,
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#334155',
          cursor: 'pointer',
        }}
        title={`${label} (JSON format)`}
      >
        <Download size={12} /> JSON
      </button>
      <button
        onClick={exportCSV}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          padding: '4px 10px',
          borderRadius: 4,
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#334155',
          cursor: 'pointer',
        }}
        title={`${label} (CSV format)`}
      >
        <Download size={12} /> CSV
      </button>
    </div>
  );
};
