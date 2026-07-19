import React from 'react';

export function Gauge({ value = 0, max = 100, label, unit, size = 120, tone = 'amber', style }) {
  const TONES = { amber: 'var(--amber)', ok: 'var(--ok)', info: 'var(--info)', danger: 'var(--danger)' };
  const color = TONES[tone] || TONES.amber;
  const pct = Math.min(1, Math.max(0, value / max));
  const a0 = -220, a1 = 40; // 扫过 260°
  const angle = a0 + (a1 - a0) * pct;
  const cx = 60, cy = 62, r = 46;
  const pt = (deg, rad) => {
    const t = (deg * Math.PI) / 180;
    return [cx + rad * Math.cos(t), cy + rad * Math.sin(t)];
  };
  const arc = (from, to, rad) => {
    const [x1, y1] = pt(from, rad), [x2, y2] = pt(to, rad);
    return 'M ' + x1 + ' ' + y1 + ' A ' + rad + ' ' + rad + ' 0 ' + (to - from > 180 ? 1 : 0) + ' 1 ' + x2 + ' ' + y2;
  };
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const deg = a0 + ((a1 - a0) * i) / 10;
    const major = i % 5 === 0;
    const [x1, y1] = pt(deg, r - (major ? 8 : 5));
    const [x2, y2] = pt(deg, r - 1);
    ticks.push(<line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={major ? 'var(--text-3)' : 'var(--text-4)'} strokeWidth={major ? 1.5 : 1} />);
  }
  const [nx, ny] = pt(angle, r - 12);
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', padding: '10px 12px 8px', borderRadius: 4,
      background: '#0A0908', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.95), 0 0 0 1px var(--line-0), 0 1px 0 var(--steel-edge)', border: '1px solid var(--line-0)',
      fontFamily: 'var(--font-display)', width: size, boxSizing: 'content-box', ...style,
    }}>
      <svg width={size} height={size * 0.82} viewBox="0 0 120 98">
        <path d={arc(a0, a1, r)} fill="none" stroke="var(--line-2)" strokeWidth="4" />
        {pct > 0 ? <path d={arc(a0, angle, r)} fill="none" stroke={color} strokeWidth="4" style={{ filter: 'drop-shadow(0 0 4px ' + color + ')' }} /> : null}
        {ticks}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2" />
        <circle cx={cx} cy={cy} r="4.5" fill="var(--bg-4)" stroke={color} strokeWidth="1.5" />
        <text x={cx} y={cy + 26} textAnchor="middle" fill="var(--text-1)" fontSize="17" fontWeight="700" fontFamily="var(--font-mono)">{value}</text>
        {unit ? <text x={cx} y={cy + 37} textAnchor="middle" fill="var(--text-3)" fontSize="8" fontFamily="var(--font-display)">{unit}</text> : null}
      </svg>
      {label ? <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)', marginTop: 2 }}>{label}</div> : null}
    </div>
  );
}
