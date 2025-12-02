import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface ClayInputProps extends TextInputProps {
    icon?: keyof typeof Ionicons.glyphMap;
    containerStyle?: ViewStyle;
    isPassword?: boolean;
}

export const ClayInput: React.FC<ClayInputProps> = ({
    icon,
    containerStyle,
    isPassword = false,
    secureTextEntry,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isSecure = isPassword || secureTextEntry;

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.inputWrapper}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={theme.colors.textMuted}
                        style={styles.inputIcon}
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry={isSecure && !showPassword}
                    {...props}
                />
                {isSecure && (
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Ionicons
                            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color={theme.colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.lg,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    inputIcon: {
        marginRight: theme.spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: theme.typography.sizes.md,
        fontFamily: theme.typography.fontFamily.regular,
        color: theme.colors.text,
        paddingVertical: theme.spacing.xs,
    },
    eyeIcon: {
        padding: theme.spacing.xs,
    },
});
