import React from 'react';

export function Breadcrumb({ items = [], onNavigate, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-display)', ...style }}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            <span className={last ? '' : 'fx-mech fx-press'}
              onClick={last ? undefined : () => onNavigate && onNavigate(it, i)}
              style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', userSelect: 'none',
                cursor: last ? 'default' : 'pointer',
                color: last ? 'var(--amber)' : 'var(--text-3)',
                padding: last ? '2px 8px' : '2px 2px',
                background: last ? 'var(--amber-tint)' : 'transparent',
                border: last ? '1px solid var(--line-0)' : 'none', borderRadius: last ? 2 : 0,
                boxShadow: last ? 'inset 0 0 0 1px var(--amber-dim), inset 0 1px 2px rgba(0,0,0,0.4)' : 'none',
              }}
              onMouseEnter={(e) => { if (!last) e.currentTarget.style.color = 'var(--text-1)'; }}
              onMouseLeave={(e) => { if (!last) e.currentTarget.style.color = 'var(--text-3)'; }}>
              {it.label}
            </span>
            {!last ? (
              <svg width="6" height="9" viewBox="0 0 6 9" style={{ flexShrink: 0 }}>
                <polyline points="1,1 5,4.5 1,8" fill="none" stroke="var(--text-4)" strokeWidth="1.5" />
              </svg>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}
