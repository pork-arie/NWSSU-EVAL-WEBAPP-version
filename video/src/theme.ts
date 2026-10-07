import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

// Same font and palette as the app (css/user.css). Sora is bundled in
// public/fonts (SIL Open Font License) so rendering needs no network.
export const fontFamily = 'Sora';

for (const weight of ['400', '500', '600', '700', '800']) {
  loadFont({ family: fontFamily, url: staticFile(`fonts/sora-latin-${weight}-normal.woff2`), weight });
}

export const C = {
  forest: '#064e3b',
  emerald: '#059669',
  mint: '#6ee7b7',
  ink: '#0f172a',
  slate: '#1e293b',
  muted: '#64748b',
  border: '#e2e8f0',
  bg: '#f1f5f9',
  white: '#ffffff',
  danger: '#dc2626',
  warning: '#d97706',
  success: '#16a34a',
};

export const FPS = 30;
