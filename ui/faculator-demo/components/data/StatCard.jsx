import React from 'react';

export function StatCard({ label, value, unit, tone = 'default', delta, deltaTone, hint, style }) {
  const TONES = { default: 'var(--text-1)', amber: 'var(--amber)', ok: 'var(--ok)', info: 'var(--info)', danger: 'var(--danger)' };
  const color = TONES[tone] || TONES.default;
  const dTone = deltaTone || (typeof delta === 'string' && delta.trim().startsWith('-') ? 'danger' : 'ok');
  return (
    <div style={{
      background: '#0C0B09', border: '1px solid var(--line-0)', padding: '7px 10px', borderRadius: 3,
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9), 0 1px 0 var(--steel-edge)', fontFamily: 'var(--font-display)', ...style,
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-4)', marginBottom: 3 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color, lineHeight: 1.1 }}>{value}</span>
        {unit ? <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{unit}</span> : null}
        {delta ? <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: TONES[dTone] }}>{delta}</span> : null}
      </div>
      {hint ? <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 3 }}>{hint}</div> : null}
    </div>
  );
}
