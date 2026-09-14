// Adapted from video-shotcraft demos/typography/brand-ink-open/BrandInkOpen.tsx
// (recipe card: opening/brand-ink-open). Motion syntax, timing ratios and the
// "1s complete hold" rule are kept from the tuned demo; only brand text,
// palette and total length (104f -> 110f, to buy a touch more hold) changed.
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from 'remotion';
import { FONT_DISPLAY, FONT_MONO, CREAM, INK, INK_SOFT, OCHRE } from './tokens';

export const BRAND_INK_OPEN_DURATION = 110;

const WORDMARK = 'Malerei Scheither';
const KICKER = 'SEIT 1864 IN LÜBECK-SCHLUTUP';

export const BrandInkOpen: React.FC = () => {
  const frame = useCurrentFrame();

  const vDraw = interpolate(frame, [0, 9], [100, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.2, 1),
  });
  const hDraw = interpolate(frame, [8, 18], [100, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.linear,
  });
  const crossFade = interpolate(frame, [24, 34], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const perChar = 0.7;
  const kickStart = 28;
  const kickChars = Math.floor(Math.max(0, frame - kickStart) / perChar);
  const kickDone = kickStart + KICKER.length * perChar;
  const cursorOn = (() => {
    if (frame < kickStart) return false;
    if (frame < kickDone) return true;
    if (frame > 106) return false;
    const b = frame - kickDone;
    return Math.floor(b / 2) % 2 === 0;
  })();

  // Wordmark glyphs finish ~70f; hold the complete lockup to 100f (30f = 1s
  // hold, the hard floor from the recipe card), then lift+shrink+fade out.
  const brandOut = interpolate(frame, [100, 110], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.4, 0, 0.5, 1),
  });
  const brandOpacity = 1 - brandOut;
  const groupY = -brandOut * 40;
  const groupScale = 1 - brandOut * 0.12;

  return (
    <AbsoluteFill style={{ backgroundColor: CREAM, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ textAlign: 'center', opacity: brandOpacity, transform: `translateY(${groupY}px) scale(${groupScale})` }}>
        <svg width={64} height={64} viewBox="0 0 64 64" style={{ display: 'block', margin: '0 auto 34px', opacity: crossFade }}>
          <line x1={32} y1={2} x2={32} y2={62} stroke={OCHRE} strokeWidth={5} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={vDraw} />
          <line x1={2} y1={32} x2={62} y2={32} stroke={OCHRE} strokeWidth={5} strokeLinecap="round" pathLength={100} strokeDasharray={100} strokeDashoffset={hDraw} />
        </svg>

        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 118, fontWeight: 600, color: INK, letterSpacing: '-0.01em', lineHeight: 1, whiteSpace: 'pre', display: 'inline-flex', alignItems: 'flex-end' }}>
          {WORDMARK.split('').map((ch, i) => {
            const delay = 10 + i * 3;
            const t = interpolate(frame, [delay, delay + 12], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.7, 0.25, 1),
            });
            const glintCenter = delay + 12;
            const glint = interpolate(frame, [glintCenter - 4, glintCenter, glintCenter + 4], [0, 1, 0], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            return (
              <span key={i} style={{ position: 'relative', display: 'inline-block', opacity: t, transform: `scale(${1.6 - 0.6 * t})`, transformOrigin: 'center bottom', filter: `blur(${(1 - t) * 6}px)` }}>
                {ch === ' ' ? ' ' : ch}
                <span style={{ position: 'absolute', left: '50%', bottom: -6, transform: 'translateX(-50%)', width: `${glint * 100}%`, height: 2, background: OCHRE, opacity: glint, borderRadius: 2 }} />
              </span>
            );
          })}
        </div>

        <div style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: '0.14em', color: INK_SOFT, marginTop: 30, textTransform: 'uppercase', height: 30, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <span style={{ whiteSpace: 'pre' }}>{KICKER.slice(0, kickChars)}</span>
          <span style={{ display: 'inline-block', width: 12, height: 22, marginLeft: 4, background: OCHRE, opacity: cursorOn ? 0.85 : 0 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
