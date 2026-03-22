import React from 'react';

interface TableColumn {
  key: string;
  label: string;
}

interface InlineTableProps {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  emptyMessage?: string;
}

export default function InlineTable({ 
  columns, 
  data, 
  emptyMessage = 'No records found.' 
}: InlineTableProps) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
          {columns.map(c => (
            <th 
              key={c.key} 
              style={{ 
                textAlign: 'left', 
                padding: '8px 10px', 
                fontWeight: 600, 
                color: '#374151' 
              }}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0
          ? (
            <tr>
              <td 
                colSpan={columns.length} 
                style={{ 
                  padding: '28px 10px', 
                  textAlign: 'center', 
                  color: '#aaa' 
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          )
          : data.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
              {columns.map(c => (
                <td 
                  key={c.key} 
                  style={{ 
                    padding: '8px 10px', 
                    color: '#444' 
                  }}
                >
                  {String(row[c.key] ?? '')}
                </td>
              ))}
            </tr>
          ))
        }
      </tbody>
    </table>
  );
}
