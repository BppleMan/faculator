import React from 'react';

export function Dialog({ open = false, title, subtitle, danger = false, footer, onClose, width = 440, style, children }) {
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(5,12,21,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width, maxWidth: '92vw', position: 'relative', borderRadius: 5,
        background: 'var(--tex-noise), linear-gradient(180deg, #423C2E, #29251C 12%, #1D1A13)', border: '1px solid var(--line-0)',
        boxShadow: 'inset 0 1px 0 rgba(233,215,170,0.30), inset 0 -1px 0 rgba(0,0,0,0.65), 0 10px 30px rgba(0,0,0,0.8)', padding: 3, ...style,
      }}>
        <div style={{ background: 'var(--plate)', border: '1px solid var(--line-0)', borderRadius: 3, overflow: 'hidden' }}>
        {danger ? <div style={{ height: 6, background: 'var(--stripes-danger)', borderBottom: '1px solid var(--line-2)' }}></div>
                : <div style={{ height: 2, background: 'var(--amber)', boxShadow: '0 0 8px var(--amber-glow)' }}></div>}
        <div className="fx-scanlines" style={{ padding: '11px 16px 9px', borderBottom: '1px solid var(--line-2)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.04em', color: danger ? 'var(--danger)' : 'var(--text-1)' }}>{title}</div>
            {subtitle ? <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-4)', marginTop: 2 }}>{subtitle}</div> : null}
          </div>
          {onClose ? (
            <span className="fx-mech fx-glow fx-press" onClick={onClose} style={{
              cursor: 'pointer', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid var(--line-3)', color: 'var(--text-3)', fontSize: 14, lineHeight: 1, userSelect: 'none',
            }}>×</span>
          ) : null}
        </div>
        <div style={{ padding: '13px 16px', fontSize: 12, color: 'var(--text-2)' }}>{children}</div>
        {footer ? (
          <div style={{ padding: '10px 16px 13px', display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--line-1)' }}>{footer}</div>
        ) : null}
        </div>
      </div>
    </div>
  );
}
