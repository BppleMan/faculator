import React from 'react';

export function Tag({ color, onRemove, style, children }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px',
      background: 'var(--tex-noise), linear-gradient(180deg, #221F18, #191712)', border: '1px solid var(--line-0)', borderRadius: 2, boxShadow: 'inset 0 1px 0 rgba(233,215,170,0.08)',
      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
      color: 'var(--text-2)', whiteSpace: 'nowrap', ...style,
    }}>
      {color ? <span style={{ width: 8, height: 8, background: color, flexShrink: 0 }}></span> : null}
      {children}
      {onRemove ? (
        <span className="fx-mech fx-press" onClick={onRemove}
          style={{ cursor: 'pointer', color: 'var(--text-3)', fontSize: 12, lineHeight: 1, paddingLeft: 2 }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; }}>×</span>
      ) : null}
    </span>
  );
}
