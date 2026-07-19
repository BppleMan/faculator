import React from 'react';

export function Tabs({ items = [], value, onChange, size = 'md', style }) {
  return (
    <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--line-2)', fontFamily: 'var(--font-display)', ...style }}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <div key={it.value} className="fx-mech fx-press" onClick={() => onChange && onChange(it.value)}
            style={{
              padding: size === 'sm' ? '4px 12px' : '6px 15px', cursor: 'pointer', userSelect: 'none', position: 'relative',
              fontSize: size === 'sm' ? 12 : 13, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap',
              color: active ? 'var(--amber-hi)' : 'var(--text-3)',
              borderRadius: '3px 3px 0 0',
              border: active ? '1px solid var(--line-0)' : '1px solid transparent', borderBottom: 'none',
              background: active ? 'var(--tex-noise), linear-gradient(180deg, #29251C, #1D1A13)' : 'transparent',
              boxShadow: active ? 'inset 0 1px 0 rgba(233,215,170,0.16)' : 'none',
                            transition: 'color 150ms var(--ease-mech), background 150ms var(--ease-mech)',
              display: 'flex', alignItems: 'center', gap: 7,
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-2)'; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-3)'; }}>
            {it.label}
            {it.count != null ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: active ? 'var(--amber)' : 'var(--text-4)' }}>{it.count}</span> : null}
            {active ? <span style={{ position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, background: 'var(--amber)', boxShadow: '0 0 6px var(--amber-glow)' }}></span> : null}
          </div>
        );
      })}
    </div>
  );
}
