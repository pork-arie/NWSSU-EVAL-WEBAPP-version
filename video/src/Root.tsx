import React from 'react';
import { Composition } from 'remotion';
import { NwssuPromo, MAIN_SECONDS } from './Main';
import { NwssuShort, SHORT_SECONDS } from './Short';
import { FPS } from './theme';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="NwssuPromo" component={NwssuPromo} durationInFrames={MAIN_SECONDS * FPS} fps={FPS} width={1920} height={1080} />
    <Composition id="NwssuShort" component={NwssuShort} durationInFrames={SHORT_SECONDS * FPS} fps={FPS} width={1080} height={1920} />
  </>
);
