import React from 'react';

export function Checkbox({ checked = false, onChange, label, disabled = false, style }) {
  return (
    <label className={disabled ? '' : 'fx-mech fx-press'}
      onClick={disabled ? undefined : (e) => { e.preventDefault(); onChange && onChange(!checked); }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, fontFamily: 'var(--font-display)', userSelect: 'none', ...style,
      }}>
      <span style={{
        width: 14, height: 14, flexShrink: 0, borderRadius: 2, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: checked ? 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #E2B34A, #B98A2C 55%, #8F681E)' : '#0A0908',
        boxShadow: checked ? 'inset 0 1px 1px rgba(255,235,170,0.5), 0 1px 2px rgba(0,0,0,0.7), 0 0 5px var(--amber-glow)' : 'inset 0 2px 3px rgba(0,0,0,0.95), 0 1px 0 var(--steel-edge)',
        border: '1px solid ' + (checked ? '#4E3810' : 'var(--line-0)'),
        transition: 'background 150ms var(--ease-mech), box-shadow 150ms var(--ease-mech)',
      }}>
        {checked ? (
          <svg width="9" height="7" viewBox="0 0 10 8"><polyline points="1,4 4,7 9,1" fill="none" stroke="var(--amber-ink)" strokeWidth="2" /></svg>
        ) : null}
      </span>
      {label ? <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{label}</span> : null}
    </label>
  );
}
