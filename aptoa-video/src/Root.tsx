import React from 'react';
import {Composition} from 'remotion';
import {AptoaPromo} from './AptoaPromo';
import cues from './cues.json';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AptoaPromo"
      component={AptoaPromo}
      durationInFrames={cues.duration}
      fps={cues.fps}
      width={1920}
      height={1080}
    />
  );
};
