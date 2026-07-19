import React from 'react';

const SIZES = {
  sm: { pad: '1px 10px', fs: 11 },
  md: { pad: '3px 14px', fs: 12 },
  lg: { pad: '6px 20px', fs: 13 },
};
// 护圈式重载按钮:金属护边(collar)→ 深井(well)→ 凸起键帽(cap)
// 键帽自带 3px 侧壁(轴体),按下沿轴下陷,侧壁消失、井影罩上来
const SKINS = {
  primary: {
    cap: 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #E2B34A, #B98A2C 55%, #8F681E)',
    color: 'var(--amber-ink)', textShadow: '0 1px 0 rgba(255,220,140,0.3)',
    capTop: 'rgba(255,235,170,0.65)', side: '#4E3810',
  },
  secondary: {
    cap: 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #353128, #211E17 55%, #16140F)',
    color: 'var(--text-1)', textShadow: '0 1px 0 rgba(0,0,0,0.7)',
    capTop: 'rgba(233,215,170,0.22)', side: '#050403',
  },
  danger: {
    cap: 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #B0492F, #86301F 55%, #611F14)',
    color: '#F0CFC5', textShadow: '0 1px 0 rgba(0,0,0,0.55)',
    capTop: 'rgba(255,195,175,0.5)', side: '#360F08',
  },
  ghost: { flat: true },
};
const TRAVEL = 3;

export function Button({ variant = 'primary', size = 'md', disabled = false, block = false, icon = null, onClick, style, children }) {
  const [down, setDown] = React.useState(false);
  const [jam, setJam] = React.useState(false); // 禁用时按下:走 1px 就被卡住
  const s = SIZES[size] || SIZES.md;
  const skin = SKINS[variant] || SKINS.primary;
  const press = down && !disabled;
  const startJam = () => { if (disabled) setJam(true); };
  const endJam = () => setJam(false);

  if (skin.flat) {
    // 低位键:直接嵌进面板的浅井,键面只比面板高一点,行程 1px
    return (
      <span style={{
        display: block ? 'block' : 'inline-block', opacity: disabled ? 0.4 : 1,
        background: '#0A0908', border: '1px solid var(--line-0)', borderRadius: 3,
        boxShadow: 'inset 0 2px 3px rgba(0,0,0,0.9), 0 1px 0 var(--steel-edge)', padding: '1px 1px 0', ...style,
      }}>
        <button type="button" disabled={disabled} onClick={disabled ? undefined : onClick}
          onMouseDown={() => setDown(true)} onMouseUp={() => setDown(false)} onMouseLeave={() => setDown(false)}
          style={{
            appearance: 'none', width: block ? '100%' : undefined, margin: 0, padding: s.pad,
            fontSize: s.fs, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1.5,
            whiteSpace: 'nowrap', cursor: disabled ? 'not-allowed' : 'pointer',
            background: 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #262219, #1B1913 60%, #141210)',
            color: 'var(--text-2)', border: '1px solid var(--line-0)', borderRadius: 2,
            textShadow: '0 1px 0 rgba(0,0,0,0.7)',
            boxShadow: press
              ? 'inset 0 2px 4px rgba(0,0,0,0.6)'
              : 'inset 0 1px 1px rgba(233,215,170,0.12), inset 0 -1px 1px rgba(0,0,0,0.4), 0 1px 0 #050403, 0 2px 2px rgba(0,0,0,0.7)',
            transform: press ? 'translateY(1px)' : 'none', marginBottom: 1,
            transition: 'transform 70ms cubic-bezier(0.3,0.6,0.3,1), box-shadow 70ms cubic-bezier(0.3,0.6,0.3,1)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
          {icon}{children}
        </button>
      </span>
    );
  }

  return (
    // 护圈:凸起的金属护边,像设备面板上突出的一圈框
    <span style={{
      display: block ? 'block' : 'inline-block',
      background: 'var(--tex-noise), linear-gradient(180deg, #423C2E, #29251C 55%, #1D1A13)',
      border: '1px solid var(--line-0)',
      borderRadius: 4,
      boxShadow: 'inset 0 1px 0 rgba(233,215,170,0.30), inset 1px 0 0 rgba(233,215,170,0.10), inset -1px 0 0 rgba(0,0,0,0.4), inset 0 -1px 0 rgba(0,0,0,0.65), 0 2px 3px rgba(0,0,0,0.6)',
      padding: 2, ...style,
    }}>
      {/* 深井:键帽坐进去的黑洞,井口有内影 */}
      <span style={{
        display: 'block', position: 'relative', background: '#060504', border: '1px solid var(--line-0)',
        borderRadius: 3,
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.95)',
        padding: '1px 1px 0',
      }}>
        <button type="button" onClick={disabled ? undefined : onClick}
          onMouseDown={disabled ? startJam : () => setDown(true)}
          onMouseUp={disabled ? endJam : () => setDown(false)}
          onMouseLeave={disabled ? endJam : () => setDown(false)}
          style={{
            appearance: 'none', width: block ? '100%' : undefined, margin: 0, padding: s.pad,
            fontSize: s.fs, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1.5,
            whiteSpace: 'nowrap', cursor: disabled ? 'not-allowed' : 'pointer',
            border: '1px solid var(--line-0)', borderRadius: 3,
            background: skin.cap, color: skin.color, textShadow: skin.textShadow,
            // 轴体:键帽下缘的实心侧壁 = 行程;按下时侧壁塌为 0,顶光转为井口罩下来的阴影
            boxShadow: press
              ? 'inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 4px 7px rgba(0,0,0,0.55)'
              : jam
              ? 'inset 0 1px 1px ' + skin.capTop + ', inset 0 -2px 2px rgba(0,0,0,0.5), 0 ' + (TRAVEL - 1) + 'px 0 ' + skin.side + ', 0 ' + TRAVEL + 'px 3px rgba(0,0,0,0.8)'
              : 'inset 0 1px 1px ' + skin.capTop + ', inset 1px 0 1px rgba(255,255,255,0.07), inset -1px 0 1px rgba(0,0,0,0.3), inset 0 -2px 2px rgba(0,0,0,0.5), 0 ' + TRAVEL + 'px 0 ' + skin.side + ', 0 ' + (TRAVEL + 1) + 'px 4px rgba(0,0,0,0.8)',
            transform: press ? 'translateY(' + TRAVEL + 'px)' : jam ? 'translateY(1px)' : 'none',
            marginBottom: TRAVEL,
            transition: press
              ? 'transform 70ms cubic-bezier(0.3, 0.6, 0.3, 1), box-shadow 70ms cubic-bezier(0.3, 0.6, 0.3, 1)'
              : jam
              ? 'transform 40ms cubic-bezier(0.2, 1, 0.2, 1), box-shadow 40ms cubic-bezier(0.2, 1, 0.2, 1)'
              : 'transform 70ms cubic-bezier(0.3, 0.6, 0.3, 1), box-shadow 70ms cubic-bezier(0.3, 0.6, 0.3, 1)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
          {icon ? <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span> : null}
          {children}
        </button>
        {disabled ? (
          <span aria-hidden="true" style={{
            position: 'absolute', zIndex: 2, right: -4, bottom: 0, pointerEvents: 'none',
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.8))',
            transformOrigin: '50% 12%',
            // 键帽下行顶到锁闩:锁头被挤着偏转一点并定住;松手随键帽回弹垂回 0 度
            transform: jam ? 'translateY(1px) rotate(-14deg)' : 'none',
            transition: jam
              ? 'transform 40ms cubic-bezier(0.2, 1, 0.2, 1)'
              : 'transform 220ms cubic-bezier(0.34, 1.4, 0.5, 1)',
          }}>
            {/* 挂锁:锁梁 + 锁体,挂在井沿右下角 */}
            <svg width="13" height="16" viewBox="0 0 13 16">
              <path d="M 3.5 7 V 4.5 A 3 3 0 0 1 9.5 4.5 V 7" fill="none" stroke="#8A8172" strokeWidth="1.6"/>
              <rect x="1.5" y="6.5" width="10" height="8.5" rx="1.2" fill="url(#lockBody)" stroke="#0A0908" strokeWidth="0.8"/>
              <defs><linearGradient id="lockBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#C8A445"/><stop offset="0.5" stopColor="#9A7A28"/><stop offset="1" stopColor="#6E561C"/>
              </linearGradient></defs>
              <circle cx="6.5" cy="10" r="1.4" fill="#241C08"/>
              <rect x="6" y="10" width="1" height="2.6" fill="#241C08"/>
            </svg>
          </span>
        ) : null}
      </span>
    </span>
  );
}
