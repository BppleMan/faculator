import React from 'react';

const TONES = { amber: 'var(--amber)', ok: 'var(--ok)', info: 'var(--info)', danger: 'var(--danger)' };

export function ProgressBar({ value = 0, max = 100, tone = 'amber', label, showValue = true, flowing = false, segments = 0, height = 12, style }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color = TONES[tone] || TONES.amber;
  return (
    <div style={{ fontFamily: 'var(--font-display)', ...style }}>
      {(label || showValue) ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-3)' }}>{label || ''}</span>
          {showValue ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color }}>{Math.round(pct)}%</span> : null}
        </div>
      ) : null}
      <div style={{
        position: 'relative', height, background: '#0A0908', borderRadius: 3,
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.95), 0 1px 0 var(--steel-edge)', border: '1px solid var(--line-0)', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, width: pct + '%',
          background: 'var(--tex-noise), linear-gradient(180deg, color-mix(in oklab, ' + color + ' 88%, white), ' + color + ' 45%, color-mix(in oklab, ' + color + ' 62%, black))',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.25), 0 0 7px ' + color, transition: 'width 300ms var(--ease-mech)',
        }}>
          {flowing ? <div style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(-45deg, rgba(0,0,0,0.18) 0 8px, transparent 8px 16px)',
            backgroundSize: '32px 100%', animation: 'fx-flow 0.8s linear infinite',
          }}></div> : null}
        </div>
        {segments > 1 ? (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'repeating-linear-gradient(90deg, transparent 0 calc(' + (100 / segments) + '% - 2px), var(--bg-0) calc(' + (100 / segments) + '% - 2px) ' + (100 / segments) + '%)',
          }}></div>
        ) : null}
      </div>
    </div>
  );
}
