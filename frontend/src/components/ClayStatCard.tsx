import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '../theme';

interface ClayStatCardProps {
    value: string;
    label: string;
    icon?: React.ReactNode;
    color: string;
    style?: StyleProp<ViewStyle>;
}

export const ClayStatCard: React.FC<ClayStatCardProps> = ({
    value,
    label,
    icon,
    color,
    style,
}) => {
    return (
        <View style={[styles.container, { backgroundColor: color }, style]}>
            <View style={styles.iconContainer}>
                {icon}
            </View>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
        ...theme.shadows.clay,
        minHeight: 140,
        width: '48%', // Default to roughly half width for grid
    },
    iconContainer: {
        marginBottom: theme.spacing.sm,
        opacity: 0.8,
    },
    value: {
        fontFamily: theme.typography.fontFamily.black, // Extra bold for stats
        fontSize: theme.typography.sizes.xxl,
        color: theme.colors.text,
        marginBottom: 4,
    },
    label: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xs,
        color: 'rgba(0,0,0,0.6)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
});
