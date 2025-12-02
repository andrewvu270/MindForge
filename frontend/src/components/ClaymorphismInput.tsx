import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface ClaymorphismInputProps {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    icon?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address' | 'numeric';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    style?: ViewStyle;
    color?: string;
    error?: string;
}

const ClaymorphismInput: React.FC<ClaymorphismInputProps> = ({
    placeholder,
    value,
    onChangeText,
    icon,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    style,
    color = theme.colors.primary,
    error,
}) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
        <View style={[styles.container, style]}>
            {/* Main input container with clay effect */}
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: color + '20',
                        borderColor: isFocused ? color + '60' : color + '40',
                        borderWidth: 2,
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

                <View style={styles.inputContent}>
                    {icon && (
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name={icon as any}
                                size={20}
                                color={isFocused ? color : theme.colors.textLight}
                            />
                        </View>
                    )}
                    
                    <TextInput
                        style={[
                            styles.textInput,
                            {
                                color: theme.colors.text,
                                paddingLeft: icon ? 8 : 16,
                            },
                        ]}
                        placeholder={placeholder}
                        placeholderTextColor={theme.colors.textLight}
                        value={value}
                        onChangeText={onChangeText}
                        secureTextEntry={secureTextEntry}
                        keyboardType={keyboardType}
                        autoCapitalize={autoCapitalize}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                    />
                </View>
            </View>

            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    inputContainer: {
        height: 56,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden',
    },
    innerHighlight: {
        position: 'absolute',
        top: 2,
        left: 2,
        right: 6,
        bottom: 6,
        borderRadius: 18,
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
    inputContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    textInput: {
        flex: 1,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 16,
        paddingRight: 16,
        zIndex: 1,
    },
    errorText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 12,
        color: theme.colors.error,
        marginTop: 4,
        marginLeft: 4,
    },
});

export default ClaymorphismInput;
