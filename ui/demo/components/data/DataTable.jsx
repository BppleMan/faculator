import React from 'react';

export function DataTable({ columns = [], rows = [], rowKey, onRowClick, dense = false, style }) {
  const pad = dense ? '3px 9px' : '5px 10px';
  return (
    <div style={{ border: '1px solid var(--line-0)', borderRadius: 3, boxShadow: 'inset 0 0 0 1px rgba(233,215,170,0.05)', background: 'var(--tex-noise), linear-gradient(180deg, #191813, #14130F)', overflow: 'auto', fontFamily: 'var(--font-display)', ...style }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--tex-noise), linear-gradient(180deg, #24211A, #1B1913)' }}>
            {columns.map((c) => (
              <th key={c.key} style={{
                padding: pad, textAlign: c.align || 'left', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.14em', color: 'var(--text-3)', borderBottom: '1px solid var(--line-3)',
                whiteSpace: 'nowrap', width: c.width,
              }}>{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey ? row[rowKey] : i} onClick={onRowClick ? () => onRowClick(row, i) : undefined}
              style={{ cursor: onRowClick ? 'pointer' : 'default', transition: 'background 90ms var(--ease-mech)' }}
              onMouseEnter={(e) => { if (onRowClick) e.currentTarget.style.background = 'var(--amber-tint)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
              {columns.map((c) => (
                <td key={c.key} style={{
                  padding: pad, textAlign: c.align || 'left', borderBottom: '1px solid var(--line-1)',
                  fontSize: 12, fontWeight: c.mono ? 700 : 600,
                  fontFamily: c.mono ? 'var(--font-mono)' : 'var(--font-display)',
                  color: c.color || (c.mono ? 'var(--text-1)' : 'var(--text-2)'), whiteSpace: 'nowrap',
                }}>{c.render ? c.render(row[c.key], row, i) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
