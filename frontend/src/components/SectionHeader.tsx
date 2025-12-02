import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    size?: 'large' | 'medium' | 'small';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    title,
    subtitle,
    size = 'large',
}) => {
    return (
        <View style={styles.container}>
            <Text style={[
                styles.title,
                size === 'large' && styles.titleLarge,
                size === 'medium' && styles.titleMedium,
                size === 'small' && styles.titleSmall,
            ]}>
                {title}
            </Text>
            {subtitle && (
                <Text style={styles.subtitle}>{subtitle}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.lg,
    },
    title: {
        fontFamily: theme.typography.fontFamily.black,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    titleLarge: {
        fontSize: theme.typography.sizes.xxxl,
        lineHeight: theme.typography.sizes.xxxl * theme.typography.lineHeights.tight,
    },
    titleMedium: {
        fontSize: theme.typography.sizes.xxl,
        lineHeight: theme.typography.sizes.xxl * theme.typography.lineHeights.tight,
    },
    titleSmall: {
        fontSize: theme.typography.sizes.xl,
        lineHeight: theme.typography.sizes.xl * theme.typography.lineHeights.tight,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.textLight,
        lineHeight: theme.typography.sizes.lg * theme.typography.lineHeights.normal,
    },
});
