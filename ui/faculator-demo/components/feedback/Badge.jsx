import React from 'react';

const TONES = {
  ok:     { color: 'var(--ok)', tint: 'var(--ok-tint)' },
  info:   { color: 'var(--info)', tint: 'var(--info-tint)' },
  warn:   { color: 'var(--warn)', tint: 'var(--warn-tint)' },
  danger: { color: 'var(--danger)', tint: 'var(--danger-tint)' },
  neutral:{ color: 'var(--text-2)', tint: 'var(--bg-3)' },
};

export function Badge({ tone = 'neutral', lamp = true, blink = false, style, children }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px',
      background: t.tint, border: '1px solid var(--line-0)', borderRadius: 2, boxShadow: 'inset 0 0 0 1px rgba(233,215,170,0.06), inset 0 1px 2px rgba(0,0,0,0.4)',
      fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
      color: t.color, whiteSpace: 'nowrap', ...style,
    }}>
      {lamp ? <span className={blink ? 'fx-lamp-blink' : ''} style={{
        width: 6, height: 6, background: t.color, boxShadow: '0 0 5px ' + (tone === 'neutral' ? 'transparent' : t.color), flexShrink: 0,
      }}></span> : null}
      {children}
    </span>
  );
}
