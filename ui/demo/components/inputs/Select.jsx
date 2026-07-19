import React from 'react';

export function Select({ label, options = [], value, onChange, placeholder = '请选择', size = 'md', disabled = false, style }) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef(null);
  React.useEffect(() => {
    const close = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);
  const current = options.find((o) => o.value === value);
  const pad = size === 'sm' ? '3px 8px' : '5px 9px';
  return (
    <div ref={rootRef} style={{ position: 'relative', fontFamily: 'var(--font-display)', opacity: disabled ? 0.4 : 1, ...style }}>
      {label ? <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 4 }}>{label}</div> : null}
      <button type="button" disabled={disabled} onClick={() => setOpen(!open)} className={disabled ? '' : 'fx-mech'}
        style={{
          appearance: 'none', margin: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          padding: pad, background: '#0A0908', borderRadius: 3, boxShadow: open ? 'inset 0 2px 4px rgba(0,0,0,0.95), 0 1px 0 var(--steel-edge), 0 0 7px var(--amber-glow)' : 'inset 0 2px 4px rgba(0,0,0,0.95), 0 1px 0 var(--steel-edge)',
          border: '1px solid ' + (open ? 'var(--amber)' : 'var(--line-2)'), cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: size === 'sm' ? 12 : 13, fontWeight: 600, color: current ? 'var(--text-1)' : 'var(--text-4)',
          fontFamily: 'var(--font-display)', transition: 'border-color 150ms var(--ease-mech)',
        }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current ? current.label : placeholder}</span>
        <svg width="10" height="6" viewBox="0 0 10 6" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms var(--ease-mech)' }}>
          <polyline points="1,1 5,5 9,1" fill="none" stroke="var(--amber)" strokeWidth="1.5" />
        </svg>
      </button>
      {open ? (
        <div style={{
          position: 'absolute', zIndex: 30, top: '100%', left: 0, right: 0, marginTop: 3,
          background: 'var(--tex-noise), linear-gradient(180deg, #29251C, #1D1A13)', border: '1px solid var(--line-0)', borderRadius: 3,
          boxShadow: 'var(--shadow-plate)', padding: 3, maxHeight: 220, overflowY: 'auto',
        }}>
          {options.map((o) => (
            <div key={o.value} onClick={() => { setOpen(false); onChange && onChange(o.value); }}
              style={{
                padding: '5px 9px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                color: o.value === value ? 'var(--amber)' : 'var(--text-2)',
                background: o.value === value ? 'var(--amber-tint)' : 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--amber-tint)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = o.value === value ? 'var(--amber-tint)' : 'transparent'; }}>
              {o.label}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
