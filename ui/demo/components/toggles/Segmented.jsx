import React from 'react';

export function Segmented({ options = [], value, onChange, size = 'md', style }) {
  const pad = size === 'sm' ? '2px 9px' : '3px 11px';
  return (
    <div style={{
      display: 'inline-flex', gap: 2, padding: 2, background: '#0A0908', borderRadius: 4,
      border: '1px solid var(--line-0)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9), 0 1px 0 var(--steel-edge)', fontFamily: 'var(--font-display)', ...style,
    }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <div key={o.value} className="fx-mech fx-press" onClick={() => onChange && onChange(o.value)}
            style={{
              padding: pad, fontSize: size === 'sm' ? 11 : 12, fontWeight: 700, letterSpacing: '0.08em',
              cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                            borderRadius: 3,
              background: active ? 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #353128, #211E17 55%, #16140F)' : 'transparent',
              color: active ? 'var(--amber-hi)' : 'var(--text-3)',
              border: active ? '1px solid var(--line-0)' : '1px solid transparent',
              boxShadow: active ? 'inset 0 1px 1px rgba(233,215,170,0.22), inset 0 -2px 2px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.7)' : 'none',
              transition: 'background 150ms var(--ease-mech), color 150ms var(--ease-mech)',
            }}>
            {o.label}
          </div>
        );
      })}
    </div>
  );
}
