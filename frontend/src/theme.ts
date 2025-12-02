export const theme = {
  colors: {
    background: '#FAFBFC', // Professional light background
    text: '#1A1D23',
    textLight: '#6B7280',
    textMuted: '#9CA3AF',
    primary: '#6366F1', // Professional indigo
    secondary: '#8B5CF6',
    accent: '#EC4899',

    // Professional Gradient Colors
    gradientStart: '#6366F1',
    gradientMid: '#8B5CF6',
    gradientEnd: '#EC4899',

    // Subtle Background Gradients
    bgGradientLight: '#F9FAFB',
    bgGradientDark: '#F3F4F6',

    // Semantic Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // UI Elements
    cardBackground: '#FFFFFF',
    cardBackgroundAlt: '#F9FAFB',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  gradients: {
    primary: ['#6366F1', '#8B5CF6', '#EC4899'],
    secondary: ['#3B82F6', '#6366F1', '#8B5CF6'],
    subtle: ['#F9FAFB', '#F3F4F6'],
    hero: ['#6366F1', '#8B5CF6'],
    card: ['#FFFFFF', '#F9FAFB'],
  },
  typography: {
    fontFamily: {
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      bold: 'Inter_700Bold',
      black: 'Inter_900Black',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 28,
      xxl: 36,
      xxxl: 48,
      display: 64,
      hero: 72,
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
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 8,
    },
  },
};
