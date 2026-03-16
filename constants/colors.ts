export const Colors = {
  // Backgrounds
  background: '#0F0F14',
  surface: '#1A1A24',
  surfaceAlt: '#22223A',
  border: '#2A2A3D',

  // Brand
  primary: '#7C5CFC',
  primaryLight: '#9B7EFF',
  primaryDark: '#5B3EDA',

  // Semantic
  income: '#2DD4A7',
  expense: '#FF6B6B',
  warning: '#FFB547',
  info: '#4FC3F7',

  // Text
  text: '#FFFFFF',
  textSecondary: '#8B8FA8',
  textMuted: '#555770',
  textInverse: '#0F0F14',

  // Progress bar states
  progressSafe: '#2DD4A7',
  progressWarning: '#FFB547',
  progressDanger: '#FF6B6B',

  // Overlays
  overlay: 'rgba(0,0,0,0.6)',
  shimmer: '#252535',
  shimmerHighlight: '#2E2E45',
} as const;

export type ColorKey = keyof typeof Colors;
