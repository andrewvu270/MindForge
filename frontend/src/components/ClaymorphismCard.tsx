import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface ClaymorphismCardProps {
    children?: React.ReactNode;
    title?: string;
    subtitle?: string;
    icon?: string;
    color?: string;
    onPress?: () => void;
    style?: ViewStyle;
    size?: 'small' | 'medium' | 'large';
    shadowIntensity?: 'light' | 'medium' | 'heavy';
}

const ClaymorphismCard: React.FC<ClaymorphismCardProps> = ({
    children,
    title,
    subtitle,
    icon,
    color = theme.colors.primary,
    onPress,
    style,
    size = 'medium',
    shadowIntensity = 'medium',
}) => {
    const getDimensions = () => {
        switch (size) {
            case 'small':
                return { width: 140, height: 120 };
            case 'medium':
                return { width: 160, height: 140 };
            case 'large':
                return { width: 180, height: 160 };
            default:
                return { width: 160, height: 140 };
        }
    };

    const getShadowStyle = () => {
        switch (shadowIntensity) {
            case 'light':
                return {
                    shadowColor: '#000',
                    shadowOffset: { width: 6, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 8,
                };
            case 'medium':
                return {
                    shadowColor: '#000',
                    shadowOffset: { width: 8, height: 8 },
                    shadowOpacity: 0.2,
                    shadowRadius: 16,
                    elevation: 12,
                };
            case 'heavy':
                return {
                    shadowColor: '#000',
                    shadowOffset: { width: 12, height: 12 },
                    shadowOpacity: 0.25,
                    shadowRadius: 20,
                    elevation: 16,
                };
            default:
                return {
                    shadowColor: '#000',
                    shadowOffset: { width: 8, height: 8 },
                    shadowOpacity: 0.2,
                    shadowRadius: 16,
                    elevation: 12,
                };
        }
    };

    const dimensions = getDimensions();
    const shadowStyle = getShadowStyle();

    return (
        <View
            style={[
                styles.container,
                dimensions,
                { backgroundColor: color + '30' },
                shadowStyle,
                style,
            ]}
        >
            <TouchableOpacity
                style={styles.touchableOverlay}
                onPress={onPress}
                activeOpacity={0.8}
                disabled={!onPress}
            >
                <LinearGradient
                    colors={[color + '60', color + '40', color + '20']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {/* Inner highlight for clay effect */}
                    <LinearGradient
                        colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0.5, y: 0.5 }}
                        style={styles.innerHighlight}
                    />

                    {/* Dark shadow overlay for depth */}
                    <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.darkOverlay}
                    />

                    <View style={styles.content}>
                        {icon && (
                            <View style={styles.iconContainer}>
                                <Ionicons name={icon as any} size={28} color={color} />
                            </View>
                        )}
                        {title && (
                            <Text style={styles.title}>{title}</Text>
                        )}
                        {subtitle && (
                            <Text style={styles.subtitle}>{subtitle}</Text>
                        )}
                        {children}
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.8)',
        position: 'relative',
        overflow: 'hidden',
    },
    touchableOverlay: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    innerHighlight: {
        position: 'absolute',
        top: 2,
        left: 2,
        right: 8,
        bottom: 8,
        borderRadius: 20,
        opacity: 0.6,
    },
    darkOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 22,
        opacity: 0.3,
    },
    content: {
        zIndex: 1,
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textLight,
        textAlign: 'center',
    },
});

export default ClaymorphismCard;
