import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface LearnCardProps {
    title: string;
    subtitle: string;
    description: string;
    lessons: number;
    color: string;
    image?: ImageSourcePropType;
    icon: string;
    onPress: () => void;
    progress?: number;
}

const LearnCard: React.FC<LearnCardProps> = ({
    title,
    subtitle,
    description,
    lessons,
    color,
    image,
    icon,
    onPress,
    progress = 0,
}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
            <LinearGradient
                colors={[color + 'FF', color + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name={icon as any} size={28} color="#FFFFFF" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.subtitle}>{subtitle}</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.description}>{description}</Text>
                    
                    <View style={styles.footer}>
                        <View style={styles.stats}>
                            <Text style={styles.lessons}>{lessons} lessons</Text>
                            {progress > 0 && (
                                <Text style={styles.progress}>{Math.round(progress)}% complete</Text>
                            )}
                        </View>
                        
                        {progress > 0 && (
                            <View style={styles.progressBar}>
                                <View 
                                    style={[
                                        styles.progressFill, 
                                        { width: `${progress}%` }
                                    ]} 
                                />
                            </View>
                        )}
                    </View>
                </View>
                
                {image && (
                    <Image 
                        source={image} 
                        style={styles.backgroundImage}
                        resizeMode="cover"
                    />
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%',
        height: 200,
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
        marginBottom: theme.spacing.lg,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
    },
    gradient: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
        padding: theme.spacing.md,
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.lg,
        color: '#FFFFFF',
        marginBottom: 2,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    description: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: theme.spacing.md,
        lineHeight: 16,
    },
    footer: {
        marginTop: 'auto',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    lessons: {
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: theme.typography.sizes.sm,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    progress: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.sm,
        color: '#FFFFFF',
    },
    progressBar: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 2,
    },
    backgroundImage: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 80,
        opacity: 0.2,
        zIndex: 0,
    },
});

export default LearnCard;
