// Adapted from video-shotcraft demos/opening/spotlight-hero-card/SpotlightHeroCard.tsx
// (recipe card: opening/spotlight-hero-card). Kept: roving->locking spotlight,
// 3D push-in, card rise/hover(sin bob)/reseat, two-lap perimeter beam, vacated
// -slot patch. Re-targeted to the real hero page texture (public/textures/hero
// -page.png) and the real swatch-card bounding box (public/textures/layout.json)
// instead of the demo's research-tool page; extended hold, and a final camera
// pull-back (zoom 2.6 -> 1.15, flattened rotation) after reseat so the shot
// ends on the real hero copy already baked into the page texture ("Vier
// Generationen Farbe. Eine Handschrift.") instead of a synthetic caption
// layer duplicating it. This is the film's single "hero protagonist" shot
// and gets the longest arc in the storyboard.
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, Easing } from 'remotion';
import { PageCam, CamKey } from '../lib/PageCam';
import layout from '../../public/textures/layout.json';
import { CREAM, OCHRE } from './tokens';

export const HERO_SPOTLIGHT_DURATION = 220;

const PAGE_H = layout.hero.pageH;
const CARD = layout.hero.swatchCard;
const MCX = CARD.x + CARD.w / 2;
const MCY = CARD.y + CARD.h / 2;
const RADIUS = 6;

// after the card settles the camera pulls back out to a comfortable overview
// (zoom 1.15, flattened rotation) so the caption — placed in PAGE space to
// the card's left, echoing the real hero layout's text/card arrangement —
// has room to breathe instead of fighting the card for the frame.
const CAM_KEYS: CamKey[] = [
  { frame: 0, cx: 960, cy: PAGE_H / 2, zoom: 0.95, rotX: 0, rotY: 0, rotZ: 0, persp: 1200 },
  { frame: 48, cx: 960, cy: PAGE_H / 2, zoom: 0.95, rotX: 0, rotY: 0, rotZ: 0, persp: 1200 },
  { frame: 64, cx: MCX - 20, cy: MCY, zoom: 2.6, rotX: 8, rotY: 30, rotZ: 1, persp: 1200 },
  { frame: 168, cx: MCX - 20, cy: MCY, zoom: 2.6, rotX: 8, rotY: 30, rotZ: 1, persp: 1200 },
  // NOTE: this framing is tuned for the 16:9 master (full authentic hero
  // recreation) — the real page content here is wide (headline starts at
  // page x~140, card ends at x~1488), too wide for any single framing to
  // also be 9:16-safe without either cropping this text or shrinking it
  // past readability. Tried biasing the frame toward the card for the
  // vertical cutdown (cx 1150/zoom 1.5); it cropped the 16:9 master's own
  // headline/CTA without actually fitting the vertical crop either, so it
  // was reverted — see the vertical-cutdown note in Main.tsx.
  { frame: 198, cx: 960, cy: 380, zoom: 1.15, rotX: 0, rotY: 0, rotZ: 0, persp: 1200 },
  { frame: 220, cx: 960, cy: 380, zoom: 1.15, rotX: 0, rotY: 0, rotZ: 0, persp: 1200 },
];
const PUSH_EASE = Easing.bezier(0.35, 0, 0.2, 1);
const POP_EASE = Easing.bezier(0.2, 1.25, 0.3, 1);
const RESEAT_EASE = Easing.bezier(0.4, 0, 0.3, 1.05);

export const HeroSpotlight: React.FC = () => {
  const frame = useCurrentFrame();

  const macroIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.3, 0, 0.2, 1),
  });

  // roving spotlight ends locked on the card's screen position in the static
  // overview framing (cx=960, cy=PAGE_H/2, zoom=0.95)
  const lockScreenX = 50 + ((MCX - 960) * 0.95) / 1920 * 100;
  const lockScreenY = 50 + ((MCY - PAGE_H / 2) * 0.95) / 1080 * 100;
  const spotEase = Easing.bezier(0.4, 0, 0.3, 1);
  const spotX = interpolate(frame, [4, 8, 16, 22, 28, 48], [25, 25, 62, 50, 58, lockScreenX], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: spotEase,
  });
  const spotY = interpolate(frame, [4, 8, 16, 22, 28, 48], [30, 30, 45, 55, 60, lockScreenY], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: spotEase,
  });
  const spotOn = interpolate(frame, [2, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const poolBase = interpolate(frame, [22, 32, 48], [560, 400, 340], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.4, 0, 0.3, 1),
  });
  const poolPulse = interpolate(frame, [32, 36, 41], [0, 0.06, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const poolRx = poolBase * (1 + poolPulse);
  const poolRy = poolBase * 0.8 * (1 + poolPulse);
  const vignette = interpolate(frame, [22, 32, 48], [0.14, 0.3, 0.38], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const rise = interpolate(frame, [64, 74], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: POP_EASE });
  const reseat = interpolate(frame, [134, 152], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: RESEAT_EASE });
  const lift = rise * (1 - reseat);
  const bob = Math.sin(((frame - 74) / 40) * Math.PI * 2) * 4 * lift;
  const z = 100 * lift + bob;
  const landed = frame >= 152;
  const press = interpolate(frame, [148, 151, 152], [1, 0.997, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const shadow = `0 ${8 * lift}px ${10 + 12 * lift}px rgba(40,30,20,${0.18 * lift}), 0 ${46 * lift}px ${90 * lift}px rgba(40,30,20,${0.22 * lift})`;

  const slotVis = Math.min(1, rise * 2) * (1 - reseat);
  const landPulse = interpolate(frame, [148, 152, 156], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const slotEdge = Math.min(1, 0.4 * (1 - reseat)) + landPulse * 0.6;

  const beam1Prog = interpolate(frame, [76, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.linear });
  const beam1On = frame >= 75 && frame <= 91;
  const beam2Prog = interpolate(frame, [96, 116], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.4, 0, 0.4, 1) });
  const beam2On = frame >= 95 && frame <= 117;
  const beamTrail = interpolate(frame, [116, 128], [0.35, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bw = CARD.w + 6;
  const bh = CARD.h + 6;

  return (
    <AbsoluteFill style={{ backgroundColor: CREAM }}>
      <AbsoluteFill style={{ opacity: macroIn }}>
        <PageCam src="textures/hero-page.png" pageH={PAGE_H} keys={CAM_KEYS} ease={PUSH_EASE}>
          <div style={{ transformStyle: 'preserve-3d' }}>
            {slotVis > 0.02 ? (
              <div
                style={{
                  position: 'absolute', left: CARD.x - 2, top: CARD.y - 2,
                  width: CARD.w + 4, height: CARD.h + 4, background: CREAM,
                  borderRadius: RADIUS,
                  boxShadow: `inset 0 0 26px rgba(140,58,43,${0.12 * slotEdge})`,
                  opacity: slotVis,
                }}
              >
                <div style={{ position: 'absolute', inset: 0, borderRadius: RADIUS, border: `1.5px solid ${OCHRE}`, opacity: slotEdge, pointerEvents: 'none' }} />
              </div>
            ) : null}

            <div
              style={{
                position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h,
                transform: `translateZ(${z}px) scale(${press})`,
                transformOrigin: 'center center', transformStyle: 'preserve-3d',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, borderRadius: RADIUS, overflow: 'hidden', boxShadow: landed ? 'none' : shadow }}>
                <Img src={staticFile('textures/swatch-card.png')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(255,255,255,0.45), transparent 40%)', opacity: lift, pointerEvents: 'none' }} />
              </div>
              <div style={{ position: 'absolute', inset: 0, borderRadius: RADIUS, boxShadow: `inset 0 0 0 1px rgba(255,255,255,${0.6 * lift})`, pointerEvents: 'none' }} />

              {(beam1On || beam2On) && lift > 0.4 ? (
                <svg width={bw} height={bh} viewBox={`0 0 ${bw} ${bh}`} style={{ position: 'absolute', left: -3, top: -3, overflow: 'visible', pointerEvents: 'none', opacity: beam1On ? 1 : 0.62, filter: `drop-shadow(0 0 6px ${OCHRE}) drop-shadow(0 0 18px rgba(140,58,43,0.4))` }}>
                  <rect x={2} y={2} width={bw - 4} height={bh - 4} rx={RADIUS} fill="none" stroke={OCHRE} strokeWidth={beam1On ? 5 : 3.5} strokeLinecap="round" pathLength={1} strokeDasharray="0.14 1" strokeDashoffset={-(beam1On ? beam1Prog : beam2Prog)} />
                  <rect x={2} y={2} width={bw - 4} height={bh - 4} rx={RADIUS} fill="none" stroke="rgba(255,248,235,0.98)" strokeWidth={beam1On ? 2.5 : 1.75} strokeLinecap="round" pathLength={1} strokeDasharray="0.14 1" strokeDashoffset={-(beam1On ? beam1Prog : beam2Prog)} />
                </svg>
              ) : null}

              {beamTrail > 0.01 ? (
                <div style={{ position: 'absolute', inset: -3, borderRadius: RADIUS + 3, border: `1.5px solid ${OCHRE}`, opacity: beamTrail, pointerEvents: 'none' }} />
              ) : null}
            </div>
          </div>
        </PageCam>

        <AbsoluteFill style={{ background: `radial-gradient(${poolRx}px ${poolRy}px at ${spotX}% ${spotY}%, rgba(255,241,214,0.4), rgba(255,241,214,0.1) 45%, rgba(60,46,32,${vignette * spotOn}) 100%)`, pointerEvents: 'none', opacity: spotOn }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
