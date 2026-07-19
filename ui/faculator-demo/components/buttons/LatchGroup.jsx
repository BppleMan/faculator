import React from 'react';

// 磁带机式锁定键组:按下不回弹、互斥;按另一键时原键自动弹起。
// allowRelease 时再按已锁定键可让其弹起(value 变为 null)。
export function LatchGroup({ options = [], value, onChange, allowRelease = false, size = 'md', disabled = false, style }) {
  const SZ = { sm: { pad: '1px 10px', fs: 11 }, md: { pad: '3px 14px', fs: 12 }, lg: { pad: '6px 20px', fs: 13 } };
  const s = SZ[size] || SZ.md;
  const TRAVEL = 3;
  return (
    // 共享护圈:一整条金属护边,各键坐在同一条深井里(像磁带机的键排)
    <span style={{
      display: 'inline-block', opacity: disabled ? 0.4 : 1,
      background: 'var(--tex-noise), linear-gradient(180deg, #423C2E, #29251C 55%, #1D1A13)',
      border: '1px solid var(--line-0)', borderRadius: 4,
      boxShadow: 'inset 0 1px 0 rgba(233,215,170,0.30), inset 0 -1px 0 rgba(0,0,0,0.65), 0 2px 3px rgba(0,0,0,0.6)',
      padding: 2, ...style,
    }}>
      <span style={{
        display: 'flex', gap: 3, background: '#060504', border: '1px solid var(--line-0)', borderRadius: 3,
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.95)', padding: '2px 2px 0',
      }}>
        {options.map((o) => {
          const latched = o.value === value;
          const press = latched && !disabled;
          return (
            <button key={o.value} type="button" disabled={disabled}
              onClick={disabled ? undefined : () => {
                if (latched) { if (allowRelease && onChange) onChange(null); }
                else if (onChange) onChange(o.value);
              }}
              title={o.title}
              style={{
                appearance: 'none', margin: 0, padding: s.pad, fontSize: s.fs,
                fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1.5,
                whiteSpace: 'nowrap', cursor: disabled ? 'not-allowed' : 'pointer',
                border: '1px solid var(--line-0)', borderRadius: 3,
                background: press
                  ? 'var(--tex-noise), linear-gradient(180deg, #16140F, #1C1A14 60%, #211E17)'
                  : 'var(--tex-noise), radial-gradient(ellipse 90% 70% at 50% 18%, #353128, #211E17 55%, #16140F)',
                color: press ? 'var(--amber-hi)' : 'var(--text-2)',
                textShadow: press ? '0 0 6px var(--amber-glow)' : '0 1px 0 rgba(0,0,0,0.7)',
                // 锁定:沉在井底,轴壁没了,井口影罩着;弹起:3px 侧壁 + 下坠影
                boxShadow: press
                  ? 'inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 4px 7px rgba(0,0,0,0.6)'
                  : 'inset 0 1px 1px rgba(233,215,170,0.22), inset 0 -2px 2px rgba(0,0,0,0.5), 0 ' + TRAVEL + 'px 0 #050403, 0 ' + (TRAVEL + 1) + 'px 4px rgba(0,0,0,0.8)',
                transform: press ? 'translateY(' + TRAVEL + 'px)' : 'none',
                marginBottom: TRAVEL,
                transition: 'transform 90ms cubic-bezier(0.3,0.6,0.3,1), box-shadow 90ms cubic-bezier(0.3,0.6,0.3,1), color 90ms',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
              {o.icon || null}{o.label}
            </button>
          );
        })}
      </span>
    </span>
  );
}
