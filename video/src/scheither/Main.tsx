// Single source of truth for shot timing (also the workbench SHOTS table —
// see references/workbench.md). All SFX cue "from" values are written as
// SHOTS.<id>.from + offset per pipeline stage 6 rule (never a bare frame
// number), so retiming a shot keeps every pinned cue in sync.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame } from 'remotion';
import { BrandInkOpen, BRAND_INK_OPEN_DURATION } from './BrandInkOpen';
import { HeroSpotlight, HERO_SPOTLIGHT_DURATION } from './HeroSpotlight';
import { GenerationsTimeline, GENERATIONS_TIMELINE_DURATION } from './GenerationsTimeline';
import { UspTitleCard, USP_TITLE_CARD_DURATION } from './UspTitleCard';
import { TrustList, TRUST_LIST_DURATION } from './TrustList';
import { Outro, OUTRO_DURATION } from './Outro';
import { DipTransition } from './transitions';
import { FlashCut } from '../lib/FlashCut';
import { FontStyles } from './FontStyles';
import { SHUTTER_GREEN, PAPER } from './tokens';

export const SHOTS = {
  open: { from: 0, duration: BRAND_INK_OPEN_DURATION, component: BrandInkOpen },
  hero: { from: BRAND_INK_OPEN_DURATION, duration: HERO_SPOTLIGHT_DURATION, component: HeroSpotlight },
  timeline: { from: BRAND_INK_OPEN_DURATION + HERO_SPOTLIGHT_DURATION, duration: GENERATIONS_TIMELINE_DURATION, component: GenerationsTimeline },
  usp: { from: BRAND_INK_OPEN_DURATION + HERO_SPOTLIGHT_DURATION + GENERATIONS_TIMELINE_DURATION, duration: USP_TITLE_CARD_DURATION, component: UspTitleCard },
  trust: { from: BRAND_INK_OPEN_DURATION + HERO_SPOTLIGHT_DURATION + GENERATIONS_TIMELINE_DURATION + USP_TITLE_CARD_DURATION, duration: TRUST_LIST_DURATION, component: TrustList },
  outro: { from: BRAND_INK_OPEN_DURATION + HERO_SPOTLIGHT_DURATION + GENERATIONS_TIMELINE_DURATION + USP_TITLE_CARD_DURATION + TRUST_LIST_DURATION, duration: OUTRO_DURATION, component: Outro },
} as const;

export const TOTAL_DURATION = SHOTS.outro.from + SHOTS.outro.duration; // 960f @30fps = 32.0s

// { from, src, volume, durationInFrames, note }[] — declarative pin table,
// every "from" relative to a SHOTS entry so the whole table survives a retime.
const SFX: { from: number; src: string; volume: number; durationInFrames: number; note: string }[] = [
  { from: SHOTS.open.from + 0, src: 'projector-spin-antique.mp3', volume: 0.1, durationInFrames: SHOTS.open.duration, note: 'opening: faint archival-film bed under the ink draw' },
  { from: SHOTS.open.from + 2, src: 'paper-slide.mp3', volume: 0.35, durationInFrames: 40, note: 'opening: crosshair ink-stroke draw' },
  { from: SHOTS.open.from + 58, src: 'hit-weak.mp3', volume: 0.3, durationInFrames: 24, note: 'opening: wordmark letterpress settle' },

  { from: SHOTS.hero.from + 40, src: 'swoosh-slow.mp3', volume: 0.28, durationInFrames: 40, note: 'hero: spotlight push-in sweep' },
  { from: SHOTS.hero.from + 152, src: 'hit-weak.mp3', volume: 0.25, durationInFrames: 24, note: 'hero: card reseat landing' },

  { from: SHOTS.timeline.from + 8, src: 'wind-pass-vibrate.mp3', volume: 0.26, durationInFrames: 118, note: 'timeline: rushing past the years' },
  { from: SHOTS.timeline.from + 128, src: 'impact-cine-big.mp3', volume: 0.4, durationInFrames: 60, note: 'timeline: hard stop on "Heute"' },

  { from: SHOTS.usp.from + 2, src: 'paper-page-turn.mp3', volume: 0.2, durationInFrames: 34, note: 'usp: word press-in rustle' },

  { from: SHOTS.trust.from + 10, src: 'paper-move-quick.mp3', volume: 0.3, durationInFrames: 24, note: 'trust: item 1' },
  { from: SHOTS.trust.from + 26, src: 'paper-move-quick.mp3', volume: 0.26, durationInFrames: 24, note: 'trust: item 2' },
  { from: SHOTS.trust.from + 42, src: 'paper-move-quick.mp3', volume: 0.22, durationInFrames: 24, note: 'trust: item 3' },

  { from: SHOTS.outro.from + 0, src: 'riser-cine.mp3', volume: 0.32, durationInFrames: 30, note: 'outro: riser building to the stamp hit' },
  { from: SHOTS.outro.from + 28, src: 'impact-movie-epic.mp3', volume: 0.5, durationInFrames: 50, note: 'outro: wordmark stamp impact (film peak)' },
  { from: SHOTS.outro.from + 72, src: 'sparkle.mp3', volume: 0.28, durationInFrames: 60, note: 'outro: shimmer after registration snap' },
];

export const ScheitherMain: React.FC = () => {
  return (
    <AbsoluteFill>
      <FontStyles />
      {Object.values(SHOTS).map((s) => {
        const Comp = s.component;
        return (
          <Sequence key={s.from} from={s.from} durationInFrames={s.duration}>
            <Comp />
          </Sequence>
        );
      })}

      {/* connective tissue: shot-transitions catalog (style A flash-cut at the
          two typography cuts; a colour dip at the page-tone changes) */}
      <Sequence from={SHOTS.open.from + SHOTS.open.duration - 7} durationInFrames={14}>
        <FlashCut duration={14} />
      </Sequence>
      <Sequence from={SHOTS.hero.from + SHOTS.hero.duration - 8} durationInFrames={16}>
        <DipTransition color={SHUTTER_GREEN} duration={16} />
      </Sequence>
      <Sequence from={SHOTS.timeline.from + SHOTS.timeline.duration - 8} durationInFrames={16}>
        <DipTransition color={PAPER} duration={16} />
      </Sequence>
      <Sequence from={SHOTS.usp.from + SHOTS.usp.duration - 7} durationInFrames={14}>
        <FlashCut duration={14} />
      </Sequence>
      <Sequence from={SHOTS.trust.from + SHOTS.trust.duration - 7} durationInFrames={14}>
        <FlashCut duration={14} />
      </Sequence>

      {SFX.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.durationInFrames}>
          <Audio src={staticFile(`audio/${s.src}`)} volume={s.volume} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// 9:16 social cutdown: centre-crops the same 1920x1080 timeline into a
// 607.5x1080 window (scaled to 1080x1920 output) — same timeline, same SFX,
// no BGM either format (per the sound-design decision recorded in the brief).
// Two-div trick: outer has no explicit width (auto-sizes to the 1920 inner
// box) and is centred with left:50%+translateX(-50%); inner is scaled
// 1.7778x from transform-origin "top center", which keeps that same centre
// point fixed while stretching height 1080->1920 (full vertical extent, no
// vertical crop) and width 1920->3413 (of which only the centre 1080px
// output window is visible — i.e. a 607.5px-wide centre crop of the source).
// Shots 1, 3, 4, 5, 6 read a shared useIsVertical() flag (useFormat.ts) and
// narrow/shrink/wrap their text so every line stays inside the crop's
// ~608px-wide safe window in that format (an earlier pass only did this for
// the hero shot; an independent review caught that shots 1/3/5/6 were also
// running full-width lines off both edges, and USP's longest single word
// alone exceeded the crop width -- all fixed per-shot, see each file).
//
// KNOWN LIMITATION (kept, not fixable the same way): shot 2 (HeroSpotlight)'s
// final pulled-back frame reveals the real hero copy baked into the page
// screenshot at its true (wide) layout position -- headline starting at page
// x~140, card ending at x~1488 -- wider than any single camera framing can
// keep inside a 608px window without either cropping this text/CTA or
// shrinking the 16:9 master's own framing to do it (tried; reverted -- see
// HeroSpotlight.tsx). This one is a real screenshot, not our own typography,
// so it can't be re-wrapped the way the other shots were. A proper fix needs
// a second, vertical-specific camera path through that shot.
export const ScheitherMainVertical: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: PAPER, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)' }}>
        <div style={{ width: 1920, height: 1080, transform: 'scale(1.7778)', transformOrigin: 'top center' }}>
          <ScheitherMain />
        </div>
      </div>
    </AbsoluteFill>
  );
};
