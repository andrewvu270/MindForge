import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageSourcePropType, Dimensions } from 'react-native';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface ClayCardProps {
    title: string;
    subtitle: string;
    description?: string;
    color: string;
    image: ImageSourcePropType;
    onPress: () => void;
    icon?: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - theme.spacing.lg * 3) / 2; // 2 columns with padding

export const ClayCard: React.FC<ClayCardProps> = ({
    title,
    subtitle,
    description,
    color,
    image,
    onPress,
    icon,
}) => {
    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: color }]}
            onPress={onPress}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={`${title} card. ${subtitle}. ${description || ''}`}
        >
            <View style={styles.imageContainer}>
                <Image source={image} style={styles.image} resizeMode="contain" />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={2}>{title}</Text>
                    {icon && <Ionicons name={icon as any} size={20} color={theme.colors.text} style={{ opacity: 0.5 }} />}
                </View>
                <Text style={styles.subtitle}>{subtitle}</Text>
                {description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {description}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 32,
        padding: theme.spacing.md, // Reduced padding
        paddingTop: 80, // Adjusted top padding
        marginBottom: 0,
        ...theme.shadows.clay,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.4)',
        minHeight: 200,
        justifyContent: 'flex-end',
        overflow: 'visible', // Explicitly allow overflow
    },
    imageContainer: {
        position: 'absolute',
        top: -50, // Adjusted top position
        left: 0,
        right: 0,
        height: 160, // Adjusted height
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100, // Increased zIndex
        elevation: 100, // Increased elevation
    },
    image: {
        width: '140%', // Made image slightly larger
        height: '140%',
    },
    content: {
        marginTop: theme.spacing.sm,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.xs,
    },
    title: {
        fontFamily: theme.typography.fontFamily.serifBold,
        fontSize: theme.typography.sizes.md + 2, // Slightly smaller font to prevent wrapping
        color: theme.colors.text,
        flex: 1,
        marginRight: theme.spacing.xs,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.primary,
        marginBottom: theme.spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    description: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: 'rgba(0,0,0,0.6)',
        lineHeight: 18,
    },
});
