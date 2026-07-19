import React from 'react';

export function Panel({ title, tag, rivets = true, chamfer = false, toolbar, padding = '10px 12px', style, children }) {
  const rivet = (pos) => (
    <span style={{
      position: 'absolute', width: 5, height: 5, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #4A463D, #23211D 70%)',
      boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,0,0,0.6)', zIndex: 1, ...pos,
    }}></span>
  );
  return (
    <div style={{
      position: 'relative', background: 'var(--plate)', border: '1px solid var(--line-0)', borderRadius: 4,
      boxShadow: 'inset 0 1px 0 rgba(233,215,170,0.18), inset 1px 0 0 rgba(233,215,170,0.06), inset -1px 0 0 rgba(0,0,0,0.4), inset 0 -1px 0 rgba(0,0,0,0.6), 0 2px 5px rgba(0,0,0,0.6)', fontFamily: 'var(--font-display)', ...style,
    }}>
      {rivets ? <React.Fragment>{rivet({ left: 5, top: 5 })}{rivet({ right: 5, top: 5 })}{rivet({ left: 5, bottom: 5 })}{rivet({ right: 5, bottom: 5 })}</React.Fragment> : null}
      {title ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 12px', borderBottom: '1px solid var(--line-2)' }}>
          <span style={{ width: 3, height: 12, background: 'var(--amber)', boxShadow: '0 0 5px var(--amber-glow)', flexShrink: 0 }}></span>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-1)', flex: 1 }}>{title}</span>
          {tag ? <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-4)' }}>{tag}</span> : null}
          {toolbar}
        </div>
      ) : null}
      <div style={{ padding }}>{children}</div>
    </div>
  );
}
