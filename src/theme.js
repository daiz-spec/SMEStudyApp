// Design System - Premium dark theme
export const colors = {
    background: '#0D1117',
    surface: '#161B22',
    surfaceElevated: '#1C2128',
    border: '#30363D',
    primary: '#58A6FF',
    primaryLight: '#79C0FF',
    primaryDark: '#388BFD',
    success: '#3FB950',
    error: '#F85149',
    warning: '#D29922',
    textPrimary: '#E6EDF3',
    textSecondary: '#8B949E',
    textMuted: '#484F58',
    cardGradientStart: '#1C2128',
    cardGradientEnd: '#161B22',
    accent: '#BC8CFF',
    gold: '#E3B341',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    h1: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
    h2: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
    h3: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
    body: { fontSize: 15, fontWeight: '400', color: colors.textPrimary, lineHeight: 24 },
    bodySmall: { fontSize: 13, fontWeight: '400', color: colors.textSecondary, lineHeight: 20 },
    caption: { fontSize: 11, fontWeight: '500', color: colors.textMuted },
    label: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const shadows = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
};
