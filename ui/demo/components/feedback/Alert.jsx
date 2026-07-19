import React from 'react';

const TONES = {
  info:   { color: 'var(--info)', tint: 'var(--info-tint)', stripes: null, title: '信息' },
  ok:     { color: 'var(--ok)', tint: 'var(--ok-tint)', stripes: null, title: '正常' },
  warn:   { color: 'var(--warn)', tint: 'var(--warn-tint)', stripes: 'var(--stripes-warn)', title: '告警' },
  danger: { color: 'var(--danger)', tint: 'var(--danger-tint)', stripes: 'var(--stripes-danger)', title: '危险' },
};

export function Alert({ tone = 'info', title, action, style, children }) {
  const t = TONES[tone] || TONES.info;
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', background: t.tint, borderRadius: 3, overflow: 'hidden',
      border: '1px solid var(--line-0)', boxShadow: 'inset 0 0 0 1px rgba(233,215,170,0.05), inset 0 1px 3px rgba(0,0,0,0.4)', fontFamily: 'var(--font-display)', ...style,
    }}>
      <div style={{ width: t.stripes ? 36 : 3, flexShrink: 0, background: t.stripes || t.color }}></div>
      <div style={{ flex: 1, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: t.color, marginRight: 10 }}>{title || t.title}</span>
          <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{children}</span>
        </div>
        {action ? <div style={{ flexShrink: 0 }}>{action}</div> : null}
      </div>
    </div>
  );
}
