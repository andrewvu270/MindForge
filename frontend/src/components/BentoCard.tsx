import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity, ImageSourcePropType, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface BentoCardProps {
    title: string;
    subtitle?: string;
    backgroundColor?: string;
    textColor?: string;
    icon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    size?: 'small' | 'medium' | 'large';
    variant?: 'default' | 'course' | 'vibrant';
    imageGradient?: string[];
    progress?: number;
    tag?: string;
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
    variant = 'default',
    imageGradient,
    progress,
    tag,
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
            {variant === 'course' && (
                <View style={styles.courseImageContainer}>
                    <LinearGradient
                        colors={imageGradient || theme.gradients.primary}
                        style={styles.courseImagePlaceholder}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {icon && <View style={styles.courseIconOverlay}>{icon}</View>}
                    </LinearGradient>
                    {tag && (
                        <View style={styles.tagContainer}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    )}
                </View>
            )}

            <View style={styles.content}>
                {(variant === 'default' || variant === 'vibrant') && icon && (
                    <View style={[
                        styles.iconContainer,
                        variant === 'vibrant' && styles.vibrantIconContainer
                    ]}>
                        {icon}
                    </View>
                )}

                <View style={styles.textContainer}>
                    <Text
                        style={[
                            styles.title,
                            { color: textColor },
                            variant === 'course' && styles.courseTitle,
                            variant === 'vibrant' && styles.vibrantTitle
                        ]}
                        numberOfLines={2}
                    >
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={[
                            styles.subtitle,
                            { color: textColor, opacity: 0.7 },
                            variant === 'vibrant' && styles.vibrantSubtitle
                        ]}>
                            {subtitle}
                        </Text>
                    )}
                </View>

                {progress !== undefined && (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    { width: `${progress}%`, backgroundColor: theme.colors.primary }
                                ]}
                            />
                        </View>
                    </View>
                )}

                {children}
            </View>
        </Container>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.lg,
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
        padding: theme.spacing.lg,
        justifyContent: 'space-between',
    },
    courseImageContainer: {
        height: 120,
        width: '100%',
        position: 'relative',
    },
    courseImagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    courseIconOverlay: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.full,
    },
    tagContainer: {
        position: 'absolute',
        bottom: theme.spacing.sm,
        left: theme.spacing.sm,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 4,
        borderRadius: theme.borderRadius.sm,
    },
    tagText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
        color: theme.colors.primary,
        textTransform: 'uppercase',
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
    courseTitle: {
        fontSize: theme.typography.sizes.md,
        lineHeight: 22,
    },
    vibrantTitle: {
        color: '#FFFFFF',
        fontSize: theme.typography.sizes.lg,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
    },
    vibrantSubtitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        opacity: 1,
    },
    vibrantIconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    progressContainer: {
        marginTop: theme.spacing.sm,
    },
    progressBar: {
        height: 4,
        backgroundColor: theme.colors.borderLight,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
});
