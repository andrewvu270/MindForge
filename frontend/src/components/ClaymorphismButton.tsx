import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface ClaymorphismButtonProps {
    title: string;
    onPress: () => void;
    color?: string;
    icon?: string;
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'secondary';
    style?: ViewStyle;
    disabled?: boolean;
}

const ClaymorphismButton: React.FC<ClaymorphismButtonProps> = ({
    title,
    onPress,
    color = theme.colors.primary,
    icon,
    size = 'medium',
    variant = 'primary',
    style,
    disabled = false,
}) => {
    const animatedValue = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(animatedValue, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(animatedValue, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const getDimensions = () => {
        switch (size) {
            case 'small':
                return { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16 };
            case 'medium':
                return { paddingHorizontal: 28, paddingVertical: 16, borderRadius: 20 };
            case 'large':
                return { paddingHorizontal: 36, paddingVertical: 20, borderRadius: 24 };
            default:
                return { paddingHorizontal: 28, paddingVertical: 16, borderRadius: 20 };
        }
    };

    const getButtonColors = () => {
        if (variant === 'secondary') {
            return {
                background: 'rgba(255,255,255,0.4)',
                border: 'rgba(255,255,255,0.8)',
                text: theme.colors.text,
            };
        }
        return {
            background: color + '40',
            border: color + '80',
            text: color,
        };
    };

    const dimensions = getDimensions();
    const colors = getButtonColors();

    return (
        <TouchableOpacity
            style={[
                styles.container,
                dimensions,
                {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    opacity: disabled ? 0.5 : 1,
                },
                style,
            ]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <Animated.View
                style={[
                    styles.buttonContent,
                    {
                        transform: [{ scale: animatedValue }],
                    },
                ]}
            >
                {/* Inner highlight */}
                <LinearGradient
                    colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.5, y: 0.5 }}
                    style={styles.innerHighlight}
                />

                {/* Dark shadow overlay */}
                <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.darkOverlay}
                />

                <View style={styles.contentRow}>
                    {icon && (
                        <Ionicons
                            name={icon as any}
                            size={size === 'small' ? 18 : size === 'large' ? 28 : 22}
                            color={colors.text}
                            style={styles.icon}
                        />
                    )}
                    <Text
                        style={[
                            styles.title,
                            {
                                color: colors.text,
                                fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
                            },
                        ]}
                    >
                        {title}
                    </Text>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    buttonContent: {
        flex: 1,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    innerHighlight: {
        position: 'absolute',
        top: 2,
        left: 2,
        right: 4,
        bottom: 4,
        borderRadius: 16,
        opacity: 0.6,
    },
    darkOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 18,
        opacity: 0.3,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
        gap: 8,
    },
    icon: {
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});

export default ClaymorphismButton;
