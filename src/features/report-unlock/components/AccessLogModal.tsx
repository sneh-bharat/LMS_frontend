'use client';

import type { AccessLogEntry } from '../types/report-unlock.types';

export function AccessLogModal({
  isOpen,
  onClose,
  logs,
}: {
  isOpen: boolean;
  onClose: () => void;
  logs: AccessLogEntry[];
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          width: 600,
          maxWidth: '90vw',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>Report Access Log History</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#666', lineHeight: 1, padding: '0 4px' }}
          >
            ×
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 13, fontWeight: 600, color: '#444', width: 60 }}>#</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 13, fontWeight: 600, color: '#444' }}>Access Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={2} style={{ padding: '32px 12px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
                  No access log records found.
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '8px 12px', fontSize: 13, color: '#555' }}>{idx + 1}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13, color: '#333' }}>{log.accessDetails}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{ background: '#5a6474', color: '#fff', border: 'none', borderRadius: 5, padding: '8px 22px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccessLogModal;
