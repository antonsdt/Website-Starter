// Adapted from video-shotcraft demos/ui-entrance/list-reveal/ListReveal.tsx
// (recipe card: ui-entrance/list-reveal). Kept: two decoupled motion layers —
// the whole list drifts slowly the entire shot while each item finds its own
// place with a soft outBack overshoot, so no frame is ever fully static.
// Re-skinned from the demo's dark SaaS-sidebar palette to the site's warm
// paper/ochre tokens; the 6 generic nav labels replaced with the 3 real
// trust-bar bullets from index.html (verbatim copy, nothing invented).
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from 'remotion';
import { FONT_SANS, PAPER, INK, OCHRE } from './tokens';
import { useIsVertical } from './useFormat';

export const TRUST_LIST_DURATION = 110;

const ITEMS = [
  'Ältester Malerbetrieb im Bezirk der Handwerkskammer Lübeck',
  'Fachbetrieb für Altbausanierung & Denkmalpflege',
  'Faire Preise, feste Zusagen',
];

const OUT_BACK = Easing.bezier(0.34, 1.56, 0.64, 1);

export const TrustList: React.FC = () => {
  const frame = useCurrentFrame();
  const isVertical = useIsVertical();
  const duration = TRUST_LIST_DURATION;
  const drift = interpolate(frame, [0, duration], [14, -14], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    // narrow, centred, stacked dot-over-text rather than a wide left-aligned
    // row. 860px (the master width) still ran item 2 off both edges of the
    // 9:16 crop's ~608px-wide safe window (flagged in independent review) --
    // narrower still at 480px for that format.
    <AbsoluteFill style={{ backgroundColor: PAPER, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: isVertical ? 480 : 860, display: 'flex', flexDirection: 'column', gap: 22, transform: `translateY(${drift}px)` }}>
        {ITEMS.map((text, i) => {
          const start = 10 + i * 16;
          const p = interpolate(frame, [start, start + 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: OUT_BACK });
          const opacity = Math.min(1, Math.max(0, p) * 2.2);
          // 0.78 is the recipe card's documented threshold ("the point at
          // which a list item is already recognisable mid-find") -- kept
          // at the card's value instead of the slightly-softer 0.86 an
          // earlier pass used (flagged in independent review).
          const scale = 0.78 + Math.min(1, Math.max(0, p)) * 0.22;
          const y = 20 * Math.max(0, 1 - Math.max(0, p));
          return (
            <div
              key={i}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 12,
                padding: isVertical ? '22px 26px' : '28px 36px', borderRadius: 8,
                background: '#f4efe3', border: '1px solid rgba(37,31,26,0.1)',
                boxShadow: '0 18px 40px rgba(37,31,26,0.08)',
                opacity, transform: `scale(${scale}) translateY(${y}px)`,
              }}
            >
              <span style={{ width: 12, height: 12, borderRadius: '50%', flex: 'none', background: OCHRE }} />
              <span style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: isVertical ? 22 : 30, lineHeight: 1.32, color: INK }}>{text}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
