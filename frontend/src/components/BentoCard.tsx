import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { theme } from '../theme';

interface BentoCardProps {
    title: string;
    subtitle?: string;
    backgroundColor?: string;
    textColor?: string;
    icon?: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
    size?: 'small' | 'medium' | 'large';
    children?: React.ReactNode;
}

export const BentoCard: React.FC<BentoCardProps> = ({
    title,
    subtitle,
    backgroundColor = theme.colors.cardBackground,
    textColor = theme.colors.text,
    icon,
    style,
    onPress,
    size = 'medium',
    children,
}) => {
    const Container = (onPress ? TouchableOpacity : View) as React.ElementType;

    return (
        <Container
            style={[
                styles.card,
                { backgroundColor },
                size === 'large' && styles.largeCard,
                size === 'small' && styles.smallCard,
                style,
            ]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.content}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: textColor }]}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
                            {subtitle}
                        </Text>
                    )}
                </View>
                {children}
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        ...theme.shadows.soft,
        marginBottom: theme.spacing.md,
        overflow: 'hidden',
    },
    largeCard: {
        minHeight: 200,
    },
    smallCard: {
        minHeight: 120,
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
    },
    iconContainer: {
        marginBottom: theme.spacing.md,
    },
    textContainer: {
        marginBottom: theme.spacing.xs,
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xl,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
    },
});
