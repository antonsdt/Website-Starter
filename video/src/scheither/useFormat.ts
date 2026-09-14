import { useVideoConfig } from 'remotion';

// ScheitherMain is always laid out at a logical 1920px width; the vertical
// cutdown just scales+centre-crops that layout afterwards (see Main.tsx).
// Composition width is still the reliable signal for "which format is this"
// since useVideoConfig() reflects the actually-registered <Composition>
// (1920 for ScheitherPromo, 1080 for ScheitherPromoVertical) regardless of
// the inline 1920px wrapper box. Shots use this to narrow text containers
// so long single lines wrap inside the 9:16 crop's ~608px-wide safe window
// instead of running off both edges.
export const useIsVertical = () => useVideoConfig().width < 1920;

// a bit under the true 607.5px crop width, for margin
export const VERTICAL_SAFE_WIDTH = 540;
