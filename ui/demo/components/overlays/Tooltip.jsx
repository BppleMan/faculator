import React from 'react';

export function Tooltip({ content, placement = 'top', style, children }) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top:    { bottom: '100%', left: '50%', transform: 'translate(-50%, -7px)' },
    bottom: { top: '100%', left: '50%', transform: 'translate(-50%, 7px)' },
    left:   { right: '100%', top: '50%', transform: 'translate(-7px, -50%)' },
    right:  { left: '100%', top: '50%', transform: 'translate(7px, -50%)' },
  }[placement] || {};
  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show ? (
        <span style={{
          position: 'absolute', zIndex: 50, whiteSpace: 'nowrap', pointerEvents: 'none',
          background: 'var(--tex-noise), linear-gradient(180deg, #29251C, #1D1A13)', border: '1px solid var(--line-0)', borderRadius: 3, boxShadow: 'inset 0 1px 0 rgba(233,215,170,0.16), inset 0 -1px 0 rgba(0,0,0,0.5), 0 3px 8px rgba(0,0,0,0.7)',
          padding: '5px 10px', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600,
          color: 'var(--text-1)', ...pos,
        }}>{content}</span>
      ) : null}
    </span>
  );
}
