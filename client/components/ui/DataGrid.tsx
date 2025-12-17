import React from 'react';
import { MockTable } from '../../types';

interface DataGridProps {
  data: any[];
  title?: string;
  className?: string;
}

export const DataGrid: React.FC<DataGridProps> = ({ data, title, className = '' }) => {
  if (!data || data.length === 0) {
    return (
      <div className={`border border-white/10 rounded p-4 text-gray-500 font-mono text-sm italic ${className}`}>
        [NO DATA TO DISPLAY]
      </div>
    );
  }

  const columns = Object.keys(data[0]);

  const renderValue = (val: any) => {
    if (val === null || val === undefined || val === 'NULL') {
      return <span className="text-gray-600 italic text-xs">NULL</span>;
    }
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    return String(val);
  };

  return (
    <div className={`overflow-hidden border border-white/20 rounded bg-void-panel ${className}`}>
      {title && (
        <div className="bg-white/5 px-4 py-2 border-b border-white/10 font-mono text-xs text-neon-cyan uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/40">
              {columns.map((col) => (
                <th key={col} className="p-3 font-mono text-xs text-gray-400 border-b border-white/10 uppercase whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors font-mono text-sm text-gray-300 border-b border-white/5 last:border-0">
                {columns.map((col) => (
                  <td key={`${idx}-${col}`} className="p-3 whitespace-nowrap">
                    {renderValue(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};