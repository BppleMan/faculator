import React from 'react';

export function NumberField({ label, value, onChange, min = -Infinity, max = Infinity, step = 1, unit, size = 'md', style }) {
  const clamp = (n) => Math.min(max, Math.max(min, n));
  const set = (n) => { if (onChange) onChange(clamp(n)); };
  const Btn = ({ txt, delta }) => {
    const [down, setDown] = React.useState(false);
    const d = size === 'sm' ? 18 : 24;
    return (
      <span style={{ display: 'inline-block', flexShrink: 0, background: 'var(--tex-noise), linear-gradient(180deg, #423C2E, #29251C 55%, #1D1A13)', border: '1px solid var(--line-0)', borderRadius: 4, boxShadow: 'inset 0 1px 0 rgba(233,215,170,0.30), inset 0 -1px 0 rgba(0,0,0,0.65), 0 2px 3px rgba(0,0,0,0.6)', padding: 2 }}>
        <span style={{ display: 'block', background: '#060504', border: '1px solid var(--line-0)', borderRadius: 3, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.95)', padding: '1px 1px 0' }}>
          <button type="button" onClick={() => set((Number(value) || 0) + delta)}
            onMouseDown={() => setDown(true)} onMouseUp={() => setDown(false)} onMouseLeave={() => setDown(false)}
            style={{
              appearance: 'none', margin: 0, padding: 0, width: d, height: d,
              background: 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #353128, #211E17 55%, #16140F)',
              border: '1px solid var(--line-0)', borderRadius: 3,
              color: 'var(--amber)', fontSize: 14, fontWeight: 700, lineHeight: 1, cursor: 'pointer', fontFamily: 'var(--font-mono)',
              boxShadow: down ? 'inset 0 3px 5px rgba(0,0,0,0.6)' : 'inset 0 1px 1px rgba(233,215,170,0.22), inset 0 -2px 2px rgba(0,0,0,0.5), 0 2px 0 #050403, 0 3px 3px rgba(0,0,0,0.8)',
              transform: down ? 'translateY(2px)' : 'none', marginBottom: 2,
              transition: 'transform 70ms cubic-bezier(0.3,0.6,0.3,1), box-shadow 70ms cubic-bezier(0.3,0.6,0.3,1)',
            }}>{txt}</button>
        </span>
      </span>
    );
  };
  return (
    <div style={{ fontFamily: 'var(--font-display)', ...style }}>
      {label ? <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 4 }}>{label}</div> : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <Btn txt="−" delta={-step} />
        <div style={{
          flex: 1, textAlign: 'center', padding: size === 'sm' ? '2px 6px' : '3px 8px', borderRadius: 3,
          background: '#0A0908', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.95), 0 1px 0 var(--steel-edge)', border: '1px solid var(--line-0)',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: size === 'sm' ? 14 : 18, fontWeight: 700, color: 'var(--amber)' }}>{value}</span>
          {unit ? <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 4 }}>{unit}</span> : null}
        </div>
        <Btn txt="+" delta={step} />
      </div>
    </div>
  );
}
