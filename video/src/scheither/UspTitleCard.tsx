// Adapted from video-shotcraft demos/typography/paper-title-card/PaperTitleCard.tsx
// (recipe card: typography/paper-title-card). Kept: word-by-word letterpress
// press-in (scale->1 + blur->0), single italic accent word, underline scaleX
// close, tail fade. Copy is an original one-line tagline for the real USP
// from the Leistungen section's service-row--featured ("Alleinstellungsmerkmal",
// Altbausanierung & Denkmalpflege) -- a paraphrase, not a page quote; digit
// -roll stat subtitle dropped (no comparable stat on the real page to cite).
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from 'remotion';
import { FONT_DISPLAY, PAPER, INK, OCHRE_DARK } from './tokens';
import { useIsVertical } from './useFormat';

export const USP_TITLE_CARD_DURATION = 60;

const WORDS: { text: string; accent?: boolean }[] = [
  { text: 'Jedes' }, { text: 'Haus' }, { text: 'verdient' },
  { text: 'denkmalgerechte', accent: true }, { text: 'Sanierung.' },
];

export const UspTitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const isVertical = useIsVertical();
  const duration = USP_TITLE_CARD_DURATION;
  const fadeOut = interpolate(frame, [duration - 8, duration], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const underline = interpolate(frame, [18, 36], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.2, 1) });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: PAPER, justifyContent: 'center', alignItems: 'center', opacity: fadeOut,
        backgroundImage: 'radial-gradient(1100px 750px at 50% 42%, rgba(255,253,248,0.9), transparent 65%)',
      }}
    >
      {/* fontSize/maxWidth narrow for the 9:16 cutdown -- "denkmalgerechte"
          alone is ~690px at the master size, wider than the crop's whole
          safe window, so it needs to shrink rather than just rewrap */}
      <div style={{ textAlign: 'center', maxWidth: isVertical ? 500 : 1500 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: isVertical ? 56 : 92, fontWeight: 500, lineHeight: 1.25, color: INK, letterSpacing: '-0.01em', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.28em' }}>
          {WORDS.map((w, i) => {
            const delay = 4 + i * 4;
            const t = interpolate(frame, [delay, delay + 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
            return (
              <span key={i} style={{ opacity: t, transform: `scale(${1.28 - 0.28 * t})`, filter: `blur(${(1 - t) * 7}px)`, display: 'inline-block', fontStyle: w.accent ? 'italic' : 'normal', color: w.accent ? OCHRE_DARK : undefined }}>
                {w.text}
              </span>
            );
          })}
        </div>
        <div style={{ height: 5, width: 200, margin: '38px auto 0', borderRadius: 3, background: OCHRE_DARK, transform: `scaleX(${underline})` }} />
      </div>
    </AbsoluteFill>
  );
};
