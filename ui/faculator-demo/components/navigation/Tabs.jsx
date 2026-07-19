import React from 'react';

// 机械铭牌标签页:整排键坐在深井导轨里;激活页是升起的钢板铭牌,
// 与下方内容面板连成一体(底缘无缝),未激活页是沉在轨里的低位键。
export function Tabs({ items = [], value, onChange, size = 'md', style }) {
  const pad = size === 'sm' ? '4px 12px' : '6px 16px';
  const fs = size === 'sm' ? 12 : 13;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 3, padding: '3px 4px 0',
      background: '#0A0908', border: '1px solid var(--line-0)', borderBottom: 'none',
      borderRadius: '4px 4px 0 0',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9), inset 0 -1px 0 rgba(233,215,170,0.05)',
      fontFamily: 'var(--font-display)', ...style,
    }}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <div key={it.value} onClick={() => onChange && onChange(it.value)}
            style={{
              padding: pad, cursor: 'pointer', userSelect: 'none', position: 'relative',
              fontSize: fs, fontWeight: 700, letterSpacing: '0.08em', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 7,
              border: '1px solid var(--line-0)', borderBottom: 'none',
              borderRadius: '3px 3px 0 0',
              marginBottom: active ? -1 : 0,
              color: active ? 'var(--text-1)' : 'var(--text-3)',
              background: active
                ? 'var(--tex-noise), linear-gradient(180deg, #2A2620, #1E1C16)'
                : 'var(--tex-noise), linear-gradient(180deg, #191712, #131210)',
              boxShadow: active
                ? 'inset 0 1px 0 rgba(233,215,170,0.22), inset 1px 0 0 rgba(233,215,170,0.08), inset -1px 0 0 rgba(0,0,0,0.4)'
                : 'inset 0 1px 1px rgba(233,215,170,0.08), inset 0 -3px 4px rgba(0,0,0,0.55)',
              transform: active ? 'none' : 'translateY(3px)',
              paddingBottom: active ? (size === 'sm' ? 7 : 9) : undefined,
              transition: 'transform 90ms cubic-bezier(0.3,0.6,0.3,1), box-shadow 90ms, color 90ms, background 90ms',
              zIndex: active ? 2 : 1,
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-2)'; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-3)'; }}>
            {/* 激活铭牌顶部的金铜嵌条 */}
            {active ? <span style={{
              position: 'absolute', top: 0, left: 6, right: 6, height: 2,
              background: 'linear-gradient(180deg, #DCA943, #A87C24)', borderRadius: '0 0 1px 1px',
              boxShadow: '0 0 5px var(--amber-glow), inset 0 1px 0 rgba(255,235,170,0.5)',
            }}></span> : null}
            {it.label}
            {it.count != null ? (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, lineHeight: 1.2,
                padding: '0 5px', borderRadius: 2,
                color: active ? 'var(--amber-hi)' : 'var(--text-4)',
                background: '#0A0908', border: '1px solid var(--line-0)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)',
              }}>{it.count}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
