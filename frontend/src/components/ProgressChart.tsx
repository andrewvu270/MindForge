import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

interface ProgressChartProps {
    data: Array<{ day: string; minutes: number; lessons: number }>;
    maxValue?: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ 
    data, 
    maxValue = Math.max(...data.map(d => d.minutes)) 
}) => {
    const barWidth = (width - theme.spacing.lg * 4) / data.length - 10;

    return (
        <View style={styles.container}>
            <View style={styles.chart}>
                {data.map((item, index) => {
                    const height = (item.minutes / maxValue) * 120;
                    const intensity = item.minutes / maxValue;
                    
                    return (
                        <View key={item.day} style={styles.barContainer}>
                            <LinearGradient
                                colors={[
                                    theme.colors.primary + 'CC',
                                    theme.colors.secondary + 'CC',
                                ]}
                                start={{ x: 0, y: 1 }}
                                end={{ x: 0, y: 0 }}
                                style={[
                                    styles.bar,
                                    {
                                        height,
                                        width: barWidth,
                                        opacity: 0.3 + intensity * 0.7,
                                    }
                                ]}
                            />
                            <Text style={styles.dayLabel}>{item.day}</Text>
                            <Text style={styles.valueLabel}>{item.minutes}m</Text>
                        </View>
                    );
                })}
            </View>
            
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={styles.legendText}>Study Time</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: theme.colors.secondary }]} />
                    <Text style={styles.legendText}>Lessons</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: theme.spacing.lg,
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 150,
        marginBottom: theme.spacing.md,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
        gap: theme.spacing.xs,
    },
    bar: {
        borderRadius: theme.borderRadius.sm,
        marginBottom: theme.spacing.xs,
    },
    dayLabel: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textLight,
    },
    valueLabel: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.text,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: theme.spacing.lg,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textLight,
    },
});

export default ProgressChart;
