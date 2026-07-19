import React from 'react';

export function Input({ label, size = 'md', error = false, prefix, suffix, mono = false, style, inputStyle, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const pad = size === 'sm' ? '3px 8px' : '5px 9px';
  const fs = size === 'sm' ? 12 : 13;
  const borderColor = error ? 'var(--danger)' : focus ? 'var(--amber)' : 'var(--line-2)';
  return (
    <label style={{ display: 'block', fontFamily: 'var(--font-display)', ...style }}>
      {label ? <span style={{ display: 'block', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)', marginBottom: 4 }}>{label}</span> : null}
      <span style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: pad,
        background: '#0A0908', borderRadius: 3,
        boxShadow: focus ? 'inset 0 2px 4px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(0,0,0,0.5), 0 1px 0 var(--steel-edge), 0 0 7px var(--amber-glow)' : 'inset 0 2px 4px rgba(0,0,0,0.95), inset 0 0 0 1px rgba(0,0,0,0.5), 0 1px 0 var(--steel-edge)',
        border: '1px solid ' + borderColor, transition: 'border-color 150ms var(--ease-mech), box-shadow 150ms var(--ease-mech)',
      }}>
        {prefix ? <span style={{ fontSize: fs - 1, color: 'var(--text-3)', flexShrink: 0 }}>{prefix}</span> : null}
        <input {...rest}
          onFocus={(e) => { setFocus(true); rest.onFocus && rest.onFocus(e); }}
          onBlur={(e) => { setFocus(false); rest.onBlur && rest.onBlur(e); }}
          style={{
            flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', padding: 0,
            fontSize: fs, fontWeight: 600, color: error ? 'var(--danger)' : 'var(--text-1)',
            fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)', ...inputStyle,
          }} />
        {suffix ? <span style={{ fontSize: fs - 2, color: 'var(--text-3)', flexShrink: 0 }}>{suffix}</span> : null}
      </span>
    </label>
  );
}
