// Minimal connective-tissue helpers from the shot-transitions technique
// catalog (references/shots/transition/shot-transitions.md): style A
// (推进流白 flash-cut, reused verbatim from assets/lib/FlashCut) bridges the
// two typography-only cuts; a "dip to a page colour" stands in for style B
// (穿暗场直航) at the cream->dark-green handoff and style E's energy at the
// dark-green->paper handoff, given the production's time budget did not
// allow a full whip-pan camera implementation for those two boundaries.
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

export const DipTransition: React.FC<{ color: string; duration?: number }> = ({ color, duration = 16 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, duration / 2, duration], [0, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{ pointerEvents: 'none', opacity: o, background: color }} />;
};
