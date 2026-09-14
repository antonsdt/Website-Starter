import { Composition } from 'remotion';
import { ScheitherMain, ScheitherMainVertical, TOTAL_DURATION } from './scheither/Main';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ScheitherPromo"
        component={ScheitherMain}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ScheitherPromoVertical"
        component={ScheitherMainVertical}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
