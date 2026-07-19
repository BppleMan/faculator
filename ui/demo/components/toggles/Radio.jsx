import React from 'react';

export function Radio({ checked = false, onChange, label, disabled = false, style }) {
  return (
    <label className={disabled ? '' : 'fx-mech fx-press'}
      onClick={disabled ? undefined : () => { onChange && onChange(true); }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, fontFamily: 'var(--font-display)', userSelect: 'none', ...style,
      }}>
      <span style={{
        width: 14, height: 14, flexShrink: 0, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: '#0A0908', boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.95), 0 1px 0 var(--steel-edge)',
        border: '1px solid ' + (checked ? '#4E3810' : 'var(--line-0)'),
        transition: 'border-color 150ms var(--ease-mech)',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: checked ? 'radial-gradient(circle at 40% 30%, #E2B34A, #B98A2C 60%, #8F681E)' : 'transparent',
          boxShadow: checked ? 'inset 0 1px 1px rgba(255,235,170,0.5), 0 0 5px var(--amber-glow)' : 'none',
          transition: 'background 150ms var(--ease-mech)',
        }}></span>
      </span>
      {label ? <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{label}</span> : null}
    </label>
  );
}

export function RadioGroup({ options = [], value, onChange, disabled = false, direction = 'row', gap = 16, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: direction === 'column' ? 'column' : 'row', gap, flexWrap: 'wrap', ...style }}>
      {options.map((o) => (
        <Radio key={o.value} checked={o.value === value} disabled={disabled || o.disabled} label={o.label}
          onChange={() => onChange && onChange(o.value)} />
      ))}
    </div>
  );
}
