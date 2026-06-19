export const Brand = {
  // Deep Moroccan Night Market Theme
  primary: '#ff6f00',       // Warm Orange
  primaryLight: '#ff9e40',  // Lighter Orange
  primaryDark: '#c43e00',   // Dark Orange
  
  // Backwards compatibility mappings for older components until refactored
  coral: '#ff6f00',       
  orange: '#ff9e40',      
  
  // Accents
  blue: '#4A90D9',
  blueLight: '#E8F2FC',
  green: '#34C759',
  greenLight: 'rgba(52, 199, 89, 0.15)', // Dark mode friendly
  red: '#FF3B30',
  redLight: 'rgba(255, 59, 48, 0.15)',   // Dark mode friendly
  
  // Surfaces & Backgrounds
  bgDark: '#121212',        // App Background
  surface: '#1E1E1E',       // Cards / Modals
  surfaceLight: '#2A2A2A',  // Received bubbles / hover states
  
  // Text Colors
  text: '#F5F5F5',
  subText: '#999999',
  
  // Old Neutrals (keeping them for compatibility, though we'll use new surfaces primarily)
  charcoal: '#1A1A2E',
  grayDark: '#8E8E93',
  grayMed: '#C7C7CC',
  grayLight: '#333333', // Darkened for dark mode borders
  warmGray: '#1E1E1E',  // Mapped to surface
  offWhite: '#121212',  // Mapped to bgDark
  white: '#1E1E1E',     // Cards mapping to surface
};

export const Colors = {
  light: {
    background: Brand.bgDark,
    card: Brand.surface,
    text: Brand.text,
    subText: Brand.subText,
    border: Brand.grayLight,
    primary: Brand.primary,
  },
  dark: {
    background: Brand.bgDark,
    card: Brand.surface,
    text: Brand.text,
    subText: Brand.subText,
    border: Brand.grayLight,
    primary: Brand.primary,
  },
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Spacing = {
  zero: 0,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 28,
  eight: 32,
  nine: 36,
  ten: 40,
};
