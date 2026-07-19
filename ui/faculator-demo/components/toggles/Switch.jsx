import React from 'react';

export function Switch({ checked = false, onChange, label, disabled = false, style }) {
  return (
    <label className={disabled ? '' : 'fx-mech fx-press'}
      onClick={disabled ? undefined : () => { onChange && onChange(!checked); }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 9, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, fontFamily: 'var(--font-display)', userSelect: 'none', ...style,
      }}>
      <span style={{
        width: 32, height: 16, flexShrink: 0, position: 'relative', borderRadius: 3,
        background: checked ? '#181104' : '#0A0908',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.95), 0 1px 0 var(--steel-edge)', border: '1px solid var(--line-0)',
        transition: 'background 150ms var(--ease-mech), border-color 150ms var(--ease-mech)',
      }}>
        <span style={{
          position: 'absolute', top: 1, left: checked ? 17 : 1, width: 12, height: 12, borderRadius: 2,
          background: checked ? 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #E2B34A, #B98A2C 55%, #8F681E)' : 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #353128, #211E17 55%, #16140F)',
          border: checked ? 'none' : '1px solid var(--line-4)', boxSizing: 'border-box',
          boxShadow: checked ? 'inset 0 1px 1px rgba(255,235,170,0.5), 0 1px 2px rgba(0,0,0,0.8), 0 0 6px var(--amber-glow)' : 'inset 0 1px 1px rgba(233,215,170,0.2), 0 1px 2px rgba(0,0,0,0.8)',
          transition: 'left 150ms var(--ease-mech), background 150ms var(--ease-mech)',
        }}></span>
      </span>
      {label ? <span style={{ fontSize: 12, fontWeight: 600, color: checked ? 'var(--text-1)' : 'var(--text-2)' }}>{label}</span> : null}
    </label>
  );
}
