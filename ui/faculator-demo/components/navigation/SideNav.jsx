import React from 'react';

export function SideNav({ sections = [], activeKey, onSelect, width = 220, style }) {
  return (
    <div style={{
      width, background: 'var(--bg-0)', borderRight: '1px solid var(--line-2)',
      fontFamily: 'var(--font-display)', display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 0', ...style,
    }}>
      {sections.map((sec, si) => (
        <div key={si} style={{ marginBottom: 6 }}>
          {sec.title ? (
            <div style={{ padding: '6px 12px 4px', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'var(--text-4)' }}>{sec.title}</div>
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(sec.items || []).map((it) => {
              const active = it.key === activeKey;
              return (
                <div key={it.key} className="fx-mech fx-press" onClick={() => onSelect && onSelect(it.key, it)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', cursor: 'pointer', userSelect: 'none',
                    fontSize: 12, fontWeight: 600, position: 'relative',
                    color: active ? 'var(--text-1)' : 'var(--text-3)',
                    background: active ? 'var(--amber-tint)' : 'transparent',
                    transition: 'background 120ms var(--ease-mech), color 120ms var(--ease-mech)',
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text-2)'; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; } }}>
                  {active ? <span style={{ position: 'absolute', left: 0, top: 3, bottom: 3, width: 2, background: 'var(--amber)', boxShadow: '0 0 6px var(--amber-glow)' }}></span> : null}
                  {it.icon ? <span style={{ display: 'inline-flex', width: 14, justifyContent: 'center', flexShrink: 0 }}>{it.icon}</span>
                           : <span style={{ width: 6, height: 6, flexShrink: 0, background: active ? 'var(--amber)' : 'var(--line-3)', transform: 'rotate(45deg)' }}></span>}
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
                  {it.meta ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-4)', flexShrink: 0 }}>{it.meta}</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
