// Adapted from video-shotcraft demos/data/timeline-travel/TimelineTravel.tsx
// (recipe card: data/timeline-travel). Kept: accelerate->brake camera pan
// along a world-space axis, per-tick spring pop-up (scaleY overshoot from the
// axis line), final hard-stop push-in on the last tick. Re-skinned from the
// generic fixture palette to the real history-section tokens (shutter green +
// gold + Fraunces), 4 ticks -> the site's real 3 timeline entries, and
// extended so the final push-in can hold the "160 Jahre" headline.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, spring } from 'remotion';
import { FONT_DISPLAY, FONT_MONO, SHUTTER_GREEN, GOLD, OCHRE } from './tokens';
import { useIsVertical } from './useFormat';

export const GENERATIONS_TIMELINE_DURATION = 200;

const W = 1920;
const AXIS_Y = 620;
const TICK_GAP = 1400;
const TICKS = [
  { year: '1864', name: 'Gerhard H. Scheither', role: 'Gründung', x: 960 },
  { year: 'Folgejahre', name: 'Heinrich, Rudolf & Gerhard', role: '2.–3. Generation', x: 960 + TICK_GAP },
  { year: 'Heute', name: 'Rainer Aichbauer', role: 'e.K.', x: 960 + TICK_GAP * 2 },
];
const WORLD_W = 960 + TICK_GAP * 2 + 960;

const TRAVEL_START = 12;
const TRAVEL_END = 130;
const ZOOM_END = 150;

const camXAt = (f: number): number => {
  const total = TICKS[2].x - 960;
  const t = interpolate(f, [TRAVEL_START, TRAVEL_END], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const eased = interpolate(t, [0, 0.15, 0.88, 1], [0, 0.055, 0.9, 1], { easing: Easing.inOut(Easing.quad) });
  return eased * total;
};

const popFrameOf = (tickX: number): number => {
  for (let f = TRAVEL_START; f <= TRAVEL_END; f++) {
    if (camXAt(f) >= tickX - 960) return f;
  }
  return TRAVEL_END;
};

const CARD_W = 480;
const CARD_H = 260;

const TickStop: React.FC<{ i: number; frame: number }> = ({ i, frame }) => {
  const tick = TICKS[i];
  const pop = popFrameOf(tick.x) - 8;
  const s = spring({ frame: frame - pop, fps: 30, config: { damping: 11, stiffness: 160, mass: 0.9 }, durationInFrames: 26 });
  const appeared = frame >= pop;

  return (
    <div style={{ position: 'absolute', left: tick.x, top: 0 }}>
      <div style={{ position: 'absolute', left: -3, top: AXIS_Y - 28, width: 6, height: 56, background: GOLD, borderRadius: 3 }} />
      <div style={{ position: 'absolute', left: -140, top: AXIS_Y + 44, width: 280, textAlign: 'center', fontFamily: FONT_MONO, fontWeight: 500, fontSize: 26, letterSpacing: '0.08em', textTransform: 'uppercase', color: GOLD }}>
        {tick.year}
      </div>
      {appeared && (
        <div style={{ position: 'absolute', left: -CARD_W / 2, top: AXIS_Y - 36 - CARD_H, transform: `scaleY(${s}) scaleX(${0.6 + 0.4 * s})`, transformOrigin: '50% 100%', opacity: Math.min(1, s * 2) }}>
          <div style={{ width: CARD_W, height: CARD_H, background: '#f4efe3', borderRadius: 6, padding: '32px 36px', boxSizing: 'border-box', boxShadow: '0 24px 50px rgba(0,0,0,0.28)' }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 18, letterSpacing: '0.08em', textTransform: 'uppercase', color: OCHRE }}>{tick.role}</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 600, color: '#251f1a', marginTop: 14, lineHeight: 1.15 }}>{tick.name}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export const GenerationsTimeline: React.FC = () => {
  const frame = useCurrentFrame();
  const isVertical = useIsVertical();
  const camX = camXAt(frame);
  const zoom = interpolate(frame, [TRAVEL_END, ZOOM_END], [1, 1.22], { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const headT = interpolate(frame, [ZOOM_END + 4, ZOOM_END + 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
  const introT = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // the "Heute" card + axis clear out before the 160-headline lands so the
  // two moments never fight for the same screen space (one effect at a time)
  const worldOut = interpolate(frame, [ZOOM_END - 4, ZOOM_END + 14], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: SHUTTER_GREEN, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 90, width: '100%', textAlign: 'center', opacity: introT, fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.1em', textTransform: 'uppercase', color: GOLD }}>
        160 Jahre Firmengeschichte
      </div>

      <div style={{ width: W, height: 1080, transform: `scale(${zoom})`, transformOrigin: '50% 58%', opacity: worldOut }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: WORLD_W, height: 1080, transform: `translateX(${-camX}px)` }}>
          <div style={{ position: 'absolute', left: 200, top: AXIS_Y - 3, width: WORLD_W - 400, height: 4, background: 'rgba(185,138,62,0.4)', borderRadius: 2 }} />
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: 960 + i * (TICK_GAP / 4) - 2, top: AXIS_Y - 10, width: 3, height: 20, background: 'rgba(185,138,62,0.35)', borderRadius: 2 }} />
          ))}
          {TICKS.map((_, i) => (
            <TickStop key={i} i={i} frame={frame} />
          ))}
        </div>
      </div>

      {/* final push-in overlay: the real "160 Jahre" headline moment. The
          closing sentence's maxWidth narrows in the 9:16 cutdown so it wraps
          inside the crop's ~608px-wide safe window instead of running off
          both edges as one long line (flagged in independent review). */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', opacity: headT, transform: `translateY(${(1 - headT) * 14}px)`, pointerEvents: 'none' }}>
        <div style={{ textAlign: 'center', maxWidth: isVertical ? 500 : 1300 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 220, fontWeight: 600, color: GOLD, lineHeight: 1 }}>160</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 22, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#dcd6c6', marginTop: -6 }}>Jahre</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: isVertical ? 38 : 46, fontWeight: 600, color: '#f4efe3', marginTop: 30, lineHeight: 1.25 }}>
            Was 1864 begann, führen wir heute fort.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
