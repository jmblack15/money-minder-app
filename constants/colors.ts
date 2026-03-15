export const Colors = {
  background: '#0F0F14',
  surface: '#1A1A24',
  surfaceElevated: '#22223A',
  primary: '#7C5CFC',
  primaryLight: '#9B7EFD',
  income: '#2DD4A7',
  expense: '#FF6B6B',
  textPrimary: '#FFFFFF',
  textSecondary: '#8B8FA8',
  border: '#2A2A3A',
  warning: '#F59E0B',
  danger: '#EF4444',
  success: '#22C55E',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;
