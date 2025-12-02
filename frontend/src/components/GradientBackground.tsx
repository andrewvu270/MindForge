import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface GradientBackgroundProps {
    variant?: 'primary' | 'secondary' | 'subtle' | 'hero' | 'card';
    children?: React.ReactNode;
    style?: any;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
    variant = 'primary',
    children,
    style,
}) => {
    const colors = theme.gradients[variant];

    return (
        <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, style]}
        >
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
});
