import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface StatCardProps {
    value: string;
    label: string;
    icon?: React.ReactNode;
    color?: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

const StatCard: React.FC<StatCardProps> = ({
    value,
    label,
    icon,
    color = theme.colors.primary,
    trend,
}) => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[color + '20', color + '10']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.value}>{value}</Text>
                        {trend && (
                            <View style={[
                                styles.trend,
                                { backgroundColor: trend.isPositive ? theme.colors.success + '20' : theme.colors.error + '20' }
                            ]}>
                                <Text style={[
                                    styles.trendText,
                                    { color: trend.isPositive ? theme.colors.success : theme.colors.error }
                                ]}>
                                    {trend.value}
                                </Text>
                            </View>
                        )}
                    </View>
                    
                    <Text style={styles.label}>{label}</Text>
                    
                    {icon && (
                        <View style={styles.iconContainer}>
                            {icon}
                        </View>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    gradient: {
        padding: theme.spacing.md,
    },
    content: {
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.xs,
    },
    value: {
        fontFamily: theme.typography.fontFamily.black,
        fontSize: theme.typography.sizes.xl,
        color: theme.colors.text,
    },
    trend: {
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
    },
    trendText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xs,
    },
    label: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textLight,
    },
    iconContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        opacity: 0.3,
    },
});

export default StatCard;
