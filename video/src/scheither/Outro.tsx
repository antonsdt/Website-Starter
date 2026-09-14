// Adapted from video-shotcraft demos/effects/riso-print-hits/RisoMisregistrationHit.tsx
// (recipe card: effects/riso-print-hits, single-hit variant). Kept: title
// slides in from off-screen and hits centre, splits into two misregistered
// ink plates that ring down (damped cosine) and then snap into perfect
// registration on a hard cut with a tiny 4f settle pulse — the print-aesthetic
// alternative to a neon glitch-hit named explicitly in the card. Re-skinned
// from the demo's generic "IMPACT" wordmark to "Malerei Scheither" in
// Fraunces, ochre/ink plates instead of grey/ink, cream/paper ground; a
// contact/CTA text reveal (real address+phone from index.html) is appended
// after the registration snap, since this shot also carries the film's outro.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { FONT_DISPLAY, FONT_MONO, PAPER, INK, INK_SOFT, OCHRE } from './tokens';
// isVertical: narrows/wraps the wordmark, tagline and address for the 9:16
// cutdown, whose ~608px-wide centre-crop otherwise runs these full-width
// lines off both edges (flagged in independent review).
import { useIsVertical } from './useFormat';

export const OUTRO_DURATION = 260;

const HIT = 28;
const SNAP = 72;
// misregistration offset: the recipe card documents ~5px as "barely
// visible" and 16px/32px total separation as the tested, working minimum
// for this effect to read as an intentional print misregistration rather
// than a rendering glitch -- keep at least that floor.
const AX = 16;
const AY = 7;
const OMEGA = (2 * Math.PI) / 18;
const TAU = 60;

const WORDMARK = 'Malerei Scheither';

const Plate: React.FC<{ color: string; dx: number; dy: number }> = ({ color, dx, dy }) => {
  const isVertical = useIsVertical();
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translate(${dx}px, ${dy}px)`, mixBlendMode: 'multiply' }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: isVertical ? 88 : 132, color, letterSpacing: '-0.01em', whiteSpace: isVertical ? 'normal' : 'nowrap', textAlign: 'center', maxWidth: isVertical ? 480 : undefined }}>{WORDMARK}</div>
    </div>
  );
};

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const isVertical = useIsVertical();

  const entering = frame >= 20 && frame < HIT;
  const split = frame >= HIT && frame < SNAP;
  const showSingle = frame < HIT || frame >= SNAP;

  const slideX = interpolate(frame, [20, HIT], [1400, 0], { easing: Easing.in(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const t = frame - HIT;
  const m = split ? Math.cos(OMEGA * t) * Math.exp(-t / TAU) : 0;
  const dx = AX * m;
  const dy = AY * m;

  const pulse = frame >= SNAP && frame < SNAP + 4 ? 1 + 0.03 * (1 - (frame - SNAP) / 4) : 1;

  const taglineT = interpolate(frame, [SNAP + 18, SNAP + 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
  const ctaT = interpolate(frame, [SNAP + 44, SNAP + 62], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.75, 0.3, 1) });

  return (
    <AbsoluteFill style={{ background: PAPER, overflow: 'hidden' }}>
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 40 }}>
        <div style={{ position: 'relative', width: isVertical ? 540 : 1920, height: isVertical ? 190 : 220 }}>
          {showSingle && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateX(${entering || frame < 20 ? slideX : 0}px) scale(${pulse})`, transformOrigin: 'center center' }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: isVertical ? 88 : 132, color: INK, letterSpacing: '-0.01em', whiteSpace: isVertical ? 'normal' : 'nowrap', textAlign: 'center', maxWidth: isVertical ? 480 : undefined }}>{WORDMARK}</div>
            </div>
          )}
          {split && (
            <>
              <Plate color={OCHRE} dx={-dx} dy={dy} />
              <Plate color={INK} dx={dx} dy={-dy} />
            </>
          )}
        </div>

        <div style={{ marginTop: 26, opacity: taglineT, transform: `translateY(${(1 - taglineT) * 10}px)`, fontFamily: FONT_MONO, fontSize: isVertical ? 20 : 24, letterSpacing: '0.1em', textTransform: 'uppercase', color: OCHRE, textAlign: 'center', maxWidth: isVertical ? 480 : undefined }}>
          Altbausanierung &amp; Denkmalpflege · seit 1864
        </div>

        <div style={{ marginTop: 64, opacity: ctaT, transform: `translateY(${(1 - ctaT) * 10}px)`, textAlign: 'center' }}>
          <div style={{ display: 'inline-block', fontFamily: FONT_MONO, fontSize: 20, letterSpacing: '0.08em', textTransform: 'uppercase', background: OCHRE, color: '#fdf8ee', padding: '20px 40px', borderRadius: 3 }}>
            Kostenlose Beratung
          </div>
          <div style={{ marginTop: 26, fontFamily: FONT_MONO, fontSize: isVertical ? 17 : 20, letterSpacing: '0.04em', color: INK_SOFT, maxWidth: isVertical ? 460 : undefined, marginLeft: 'auto', marginRight: 'auto' }}>
            Schlutuper Kirchstr. 7, 23568 Lübeck · 0451 86 58 74
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
