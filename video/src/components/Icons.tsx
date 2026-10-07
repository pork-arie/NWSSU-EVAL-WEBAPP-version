import React from 'react';

type P = { size?: number; color?: string; stroke?: number };

const Svg: React.FC<P & { children: React.ReactNode }> = ({ size = 24, color = 'currentColor', stroke = 2, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

export const Check: React.FC<P> = (p) => <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></Svg>;
export const Eye: React.FC<P> = (p) => (
  <Svg {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Svg>
);
export const EyeOff: React.FC<P> = (p) => (
  <Svg {...p}><path d="M3 3l18 18" /><path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17.6 17.6 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></Svg>
);
export const Plane: React.FC<P> = (p) => (
  <Svg {...p}><path d="M10.5 21v-2l2-1.5V13l-8 3v-2l8-5V3.5a1.5 1.5 0 0 1 3 0V9l8 5v2l-8-3v4.5l2 1.5v2l-3.5-1z" /></Svg>
);
export const Wifi: React.FC<P> = (p) => (
  <Svg {...p}><path d="M2 8.8a15 15 0 0 1 20 0" /><path d="M5 12.6a10 10 0 0 1 14 0" /><path d="M8.5 16.3a5 5 0 0 1 7 0" /><circle cx="12" cy="19.5" r="0.6" /></Svg>
);
export const Bell: React.FC<P> = (p) => (
  <Svg {...p}><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></Svg>
);
export const Lock: React.FC<P> = (p) => (
  <Svg {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Svg>
);
export const CloudOff: React.FC<P> = (p) => (
  <Svg {...p}><path d="M3 3l18 18" /><path d="M8.5 8.5A5 5 0 0 0 6 18h11" /><path d="M20.5 16.5A4 4 0 0 0 17 10h-1.3A7 7 0 0 0 10 5.3" /></Svg>
);
export const Back: React.FC<P> = (p) => <Svg {...p}><path d="M15 18l-6-6 6-6" /></Svg>;
export const Doc: React.FC<P> = (p) => (
  <Svg {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /><path d="M8 13h8M8 17h5" /></Svg>
);
