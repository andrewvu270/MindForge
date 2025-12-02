export const theme = {
  colors: {
    background: '#FDFBF7', // Cream/Off-white background
    text: '#2C2C2C', // Softer black
    textLight: '#6B6B6B',
    textMuted: '#9CA3AF',
    primary: '#2F3E46', // Dark Slate/Navy
    secondary: '#52796F', // Sage Green
    accent: '#D4A373', // Terracotta/Sand
    searchBackground: '#F3F0EB', // Slightly darker cream

    // Professional Gradient Colors (Kept for compatibility but updated to vintage tones)
    gradientStart: '#2F3E46',
    gradientMid: '#354F52',
    gradientEnd: '#52796F',

    // Subtle Background Gradients
    bgGradientLight: '#FDFBF7',
    bgGradientDark: '#F3F0EB',

    // Semantic Colors
    success: '#84A98C', // Muted Green
    warning: '#E9C46A', // Muted Yellow
    error: '#E76F51', // Burnt Orange
    info: '#8DA9C4', // Muted Blue

    // UI Elements
    cardBackground: '#FFFFFF',
    cardBackgroundAlt: '#F9F7F2',
    border: '#E6E2D8',
    borderLight: '#F3F0EB',
    shadow: '#8D8D8D',
    overlay: 'rgba(47, 62, 70, 0.5)',

    // Vintage Palette (Replacing Vibrant)
    vintage: {
      cream: '#FDFBF7',
      sage: '#84A98C',
      lavender: '#B5B2C2', // Muted Lavender
      terracotta: '#E76F51',
      navy: '#2F3E46',
      sand: '#E9C46A',
      slate: '#52796F',
    },
    // Keep vibrant structure for compatibility but map to vintage colors
    vibrant: {
      red: '#E76F51', // Terracotta
      green: '#84A98C', // Sage
      blue: '#8DA9C4', // Muted Blue
      yellow: '#E9C46A', // Sand
      purple: '#B5B2C2', // Lavender
      black: '#2F3E46', // Navy
    },
  },
  gradients: {
    primary: ['#2F3E46', '#354F52'], // Navy gradient
    secondary: ['#52796F', '#84A98C'], // Sage gradient
    banner: ['#2F3E46', '#52796F'], // Navy to Sage
    subtle: ['#FDFBF7', '#F3F0EB'],
    hero: ['#2F3E46', '#354F52'],
    card: ['#FFFFFF', '#FFFFFF'],
  },
  typography: {
    fontFamily: {
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      bold: 'Inter_700Bold',
      black: 'Inter_900Black',
      serif: 'PlayfairDisplay_400Regular',
      serifBold: 'PlayfairDisplay_700Bold',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
      xxxl: 40,
      display: 48,
      hero: 56,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  borderRadius: {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    full: 9999,
  },
  shadows: {
    soft: {
      shadowColor: '#8D8D8D',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 5,
    },
    medium: {
      shadowColor: '#8D8D8D',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.12,
      shadowRadius: 30,
      elevation: 10,
    },
    large: {
      shadowColor: '#8D8D8D',
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.15,
      shadowRadius: 40,
      elevation: 15,
    },
  },
};
