export const Brand = {
  // New Dark Green Premium Palette
  primary: '#08403E',       // Deep Forest Green
  primaryLight: '#187063',  // Vibrant Mint/Emerald
  primaryDark: '#042826',   // Very Dark Green
  
  // Replacing old coral/orange variables with the new green ones to prevent breaking changes in some components
  coral: '#08403E',       
  orange: '#187063',      
  
  // Accents
  blue: '#4A90D9',
  blueLight: '#E8F2FC',
  green: '#34C759',
  greenLight: '#EAF9EE',
  red: '#FF3B30',
  redLight: '#FFEBEC',
  
  // Neutrals
  charcoal: '#1A1A2E',
  grayDark: '#8E8E93',
  grayMed: '#C7C7CC',
  grayLight: '#E5E5EA',
  warmGray: '#F4F7F6',    // Slightly cool/green tinted off-white
  offWhite: '#FAFAFA',
  white: '#FFFFFF',
};

export const Colors = {
  light: {
    background: Brand.offWhite,
    card: Brand.white,
    text: Brand.charcoal,
    subText: Brand.grayDark,
    border: Brand.grayLight,
    primary: Brand.primary,
  },
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    text: Brand.offWhite,
    subText: Brand.grayMed,
    border: '#333333',
    primary: Brand.primaryLight,
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
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
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
