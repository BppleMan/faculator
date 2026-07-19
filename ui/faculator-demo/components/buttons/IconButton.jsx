import React from 'react';

const SIZES = { sm: 18, md: 24, lg: 30 };
const SKINS = {
  secondary: {
    cap: 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #353128, #211E17 55%, #16140F)',
    color: 'var(--text-2)', capTop: 'rgba(233,215,170,0.22)', side: '#050403',
  },
  primary: {
    cap: 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #E2B34A, #B98A2C 55%, #8F681E)',
    color: 'var(--amber-ink)', capTop: 'rgba(255,235,170,0.65)', side: '#4E3810',
  },
  danger: {
    cap: 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #B0492F, #86301F 55%, #611F14)',
    color: '#F0CFC5', capTop: 'rgba(255,195,175,0.5)', side: '#360F08',
  },
  ghost: { flat: true },
};
const TRAVEL = 3;

export function IconButton({ variant = 'secondary', size = 'md', disabled = false, title, onClick, style, children }) {
  const [down, setDown] = React.useState(false);
  const d = SIZES[size] || SIZES.md;
  const skin = SKINS[variant] || SKINS.secondary;
  const press = down && !disabled;

  if (skin.flat) {
    return (
      <span style={{
        display: 'inline-block', opacity: disabled ? 0.4 : 1,
        background: '#0A0908', border: '1px solid var(--line-0)', borderRadius: 3,
        boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.9), 0 1px 0 var(--steel-edge)', padding: '1px 1px 0', ...style,
      }}>
        <button type="button" title={title} disabled={disabled} onClick={disabled ? undefined : onClick}
          onMouseDown={() => setDown(true)} onMouseUp={() => setDown(false)} onMouseLeave={() => setDown(false)}
          style={{
            appearance: 'none', margin: 0, padding: 0, width: d, height: d,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: Math.round(d * 0.55), fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #262219, #1B1913 60%, #141210)',
            color: 'var(--text-3)', border: '1px solid var(--line-0)', borderRadius: 2,
            boxShadow: press
              ? 'inset 0 2px 4px rgba(0,0,0,0.6)'
              : 'inset 0 1px 1px rgba(233,215,170,0.12), 0 1px 0 #050403, 0 2px 2px rgba(0,0,0,0.7)',
            transform: press ? 'translateY(1px)' : 'none', marginBottom: 1,
            transition: 'transform 70ms cubic-bezier(0.3,0.6,0.3,1), box-shadow 70ms cubic-bezier(0.3,0.6,0.3,1)',
          }}>{children}</button>
      </span>
    );
  }

  return (
    <span style={{
      display: 'inline-block', opacity: disabled ? 0.4 : 1,
      background: 'var(--tex-noise), linear-gradient(180deg, #423C2E, #29251C 55%, #1D1A13)',
      border: '1px solid var(--line-0)',
      borderRadius: 4,
      boxShadow: 'inset 0 1px 0 rgba(233,215,170,0.30), inset 0 -1px 0 rgba(0,0,0,0.65), 0 2px 3px rgba(0,0,0,0.6)',
      padding: 2, ...style,
    }}>
      <span style={{
        display: 'block', background: '#060504', border: '1px solid var(--line-0)',
        borderRadius: 3,
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.95)', padding: '1px 1px 0',
      }}>
        <button type="button" title={title} disabled={disabled} onClick={disabled ? undefined : onClick}
          onMouseDown={() => setDown(true)} onMouseUp={() => setDown(false)} onMouseLeave={() => setDown(false)}
          style={{
            appearance: 'none', margin: 0, padding: 0, width: d, height: d,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: Math.round(d * 0.55), fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1,
            cursor: disabled ? 'not-allowed' : 'pointer', border: '1px solid var(--line-0)', borderRadius: 3,
            background: skin.cap, color: skin.color,
            boxShadow: press
              ? 'inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 4px 7px rgba(0,0,0,0.55)'
              : 'inset 0 1px 1px ' + skin.capTop + ', inset 0 -2px 2px rgba(0,0,0,0.5), 0 ' + TRAVEL + 'px 0 ' + skin.side + ', 0 ' + (TRAVEL + 1) + 'px 4px rgba(0,0,0,0.8)',
            transform: press ? 'translateY(' + TRAVEL + 'px)' : 'none',
            marginBottom: TRAVEL,
            transition: 'transform 70ms cubic-bezier(0.3, 0.6, 0.3, 1), box-shadow 70ms cubic-bezier(0.3, 0.6, 0.3, 1)',
          }}>
          {children}
        </button>
      </span>
    </span>
  );
}
