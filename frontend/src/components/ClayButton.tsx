import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface ClayButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline';
    gradientColors?: string[];
    textStyle?: TextStyle;
    containerStyle?: ViewStyle;
    fullWidth?: boolean;
}

export const ClayButton: React.FC<ClayButtonProps> = ({
    title,
    variant = 'primary',
    gradientColors,
    textStyle,
    containerStyle,
    fullWidth = false,
    ...props
}) => {
    const getGradientColors = () => {
        if (gradientColors) return gradientColors;

        switch (variant) {
            case 'primary':
                return [theme.colors.clay.teal, theme.colors.clay.blue];
            case 'secondary':
                return [theme.colors.clay.pink, theme.colors.clay.yellow];
            case 'outline':
                return ['transparent', 'transparent'];
            default:
                return [theme.colors.clay.teal, theme.colors.clay.blue];
        }
    };

    const getButtonStyle = () => {
        const baseStyle = [styles.button, containerStyle];

        if (fullWidth) {
            baseStyle.push(styles.fullWidth);
        }

        if (variant === 'outline') {
            baseStyle.push(styles.outlineButton);
        }

        return baseStyle;
    };

    const getTextColor = () => {
        if (variant === 'outline') {
            return theme.colors.clay.teal;
        }
        return theme.colors.cardBackground;
    };

    return (
        <TouchableOpacity
            style={getButtonStyle()}
            activeOpacity={0.8}
            {...props}
        >
            <LinearGradient
                colors={getGradientColors()}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
                    {title}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        ...theme.shadows.medium,
    },
    fullWidth: {
        width: '100%',
    },
    outlineButton: {
        borderWidth: 2,
        borderColor: theme.colors.clay.teal,
    },
    gradient: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: theme.typography.sizes.lg,
        fontFamily: theme.typography.fontFamily.bold,
    },
});
