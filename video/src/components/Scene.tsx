import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { iv, useT } from '../anim';

const X = 0.25; // crossfade half-length (s)

const Inner: React.FC<{ dur: number; render: (t: number) => React.ReactNode; first?: boolean; last?: boolean }> = ({ dur, render, first, last }) => {
  const t = useT() - X;
  const o = Math.min(first ? 1 : iv(t, -X, X), last ? 1 : 1 - iv(t, dur - X, dur + X));
  return <AbsoluteFill style={{ opacity: o }}>{render(t)}</AbsoluteFill>;
};

// One storyboard scene: `render` receives seconds since the scene's start.
export const Scene: React.FC<{ start: number; dur: number; render: (t: number) => React.ReactNode; first?: boolean; last?: boolean }> = ({ start, dur, ...rest }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.round((start - X) * fps)} durationInFrames={Math.round((dur + 2 * X) * fps)}>
      <Inner dur={dur} {...rest} />
    </Sequence>
  );
};

// Positions a child by its top-left corner, scaled from there.
export const Place: React.FC<{ x: number; y: number; scale?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, scale = 1, children, style }) => (
  <div style={{ position: 'absolute', left: x, top: y, transform: `scale(${scale})`, transformOrigin: 'top left', ...style }}>{children}</div>
);
