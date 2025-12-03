import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { apiService } from '../services/api';

const CurriculumScreen = ({ route, navigation }: any) => {
    const { fieldId, fieldName, color } = route.params;
    const [curriculum, setCurriculum] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadCurriculum();
    }, [fieldId]);

    const loadCurriculum = async () => {
        try {
            setLoading(true);
            const data = await apiService.getCurriculum(fieldId);
            setCurriculum(data);
        } catch (error) {
            console.log('No existing curriculum found, user can generate one.');
            setCurriculum(null);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            const data = await apiService.generateCurriculum(fieldId);
            setCurriculum(data);
        } catch (error) {
            Alert.alert('Error', 'Failed to generate curriculum. Please try again.');
            console.error(error);
        } finally {
            setGenerating(false);
        }
    };

    const renderLessonNode = (lesson: any, index: number) => {
        const isLocked = index > 0 && !curriculum.lessons[index - 1].is_completed;
        const isCompleted = lesson.is_completed;
        const isActive = !isLocked && !isCompleted;

        return (
            <View key={index} style={styles.nodeContainer}>
                {/* Connector Line */}
                {index < curriculum.lessons.length - 1 && (
                    <View style={[
                        styles.connector,
                        isCompleted ? styles.connectorCompleted : styles.connectorLocked
                    ]} />
                )}

                <TouchableOpacity
                    style={[
                        styles.node,
                        isCompleted && styles.nodeCompleted,
                        isActive && styles.nodeActive,
                        isLocked && styles.nodeLocked,
                        { borderColor: isLocked ? '#333' : color }
                    ]}
                    disabled={isLocked}
                    onPress={() => navigation.navigate('LessonDetail', {
                        lessonId: 'generated_lesson', // In real app, this would be a real ID
                        lessonData: lesson // Pass data to generate on fly if needed
                    })}
                >
                    <View style={[
                        styles.iconContainer,
                        { backgroundColor: isLocked ? '#333' : (isActive ? color : 'transparent') }
                    ]}>
                        <Ionicons
                            name={isCompleted ? "checkmark" : (isLocked ? "lock-closed" : "play")}
                            size={24}
                            color={isActive ? '#FFF' : (isLocked ? '#666' : color)}
                        />
                    </View>

                    <View style={styles.nodeContent}>
                        <Text style={[
                            styles.nodeTitle,
                            isLocked && styles.textLocked
                        ]}>
                            {lesson.title}
                        </Text>
                        <Text style={styles.nodeDescription} numberOfLines={2}>
                            {lesson.description}
                        </Text>
                        <View style={styles.nodeMeta}>
                            <Text style={styles.difficulty}>{lesson.difficulty}</Text>
                            <Text style={styles.topics}>{lesson.key_topics.slice(0, 2).join(', ')}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={color} />
                <Text style={styles.loadingText}>Loading path...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[color + '40', theme.colors.background]}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>{fieldName} Path</Text>
                <Text style={styles.headerSubtitle}>Mastery Curriculum</Text>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {!curriculum ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="map-outline" size={80} color={color} style={{ opacity: 0.5 }} />
                        <Text style={styles.emptyTitle}>No Path Created Yet</Text>
                        <Text style={styles.emptyDescription}>
                            Generate a personalized learning path to master {fieldName} step-by-step.
                        </Text>

                        <TouchableOpacity
                            style={[styles.generateButton, { backgroundColor: color }]}
                            onPress={handleGenerate}
                            disabled={generating}
                        >
                            {generating ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="flash" size={20} color="#FFF" />
                                    <Text style={styles.generateButtonText}>Generate Path</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.pathContainer}>
                        {curriculum.lessons.map((lesson: any, index: number) =>
                            renderLessonNode(lesson, index)
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    loadingText: {
        marginTop: 10,
        color: theme.colors.textLight,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: theme.typography.fontFamily.black,
        color: theme.colors.text,
    },
    headerSubtitle: {
        fontSize: 16,
        color: theme.colors.textLight,
        fontFamily: theme.typography.fontFamily.medium,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyTitle: {
        fontSize: 24,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.text,
        marginTop: 20,
        marginBottom: 10,
    },
    emptyDescription: {
        fontSize: 16,
        color: theme.colors.textLight,
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    generateButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: theme.typography.fontFamily.bold,
    },
    pathContainer: {
        paddingVertical: 20,
    },
    nodeContainer: {
        marginBottom: 0,
        position: 'relative',
    },
    connector: {
        position: 'absolute',
        left: 24,
        top: 50,
        bottom: -20,
        width: 2,
        backgroundColor: '#333',
        zIndex: -1,
    },
    connectorCompleted: {
        backgroundColor: theme.colors.primary,
    },
    connectorLocked: {
        backgroundColor: '#333',
    },
    node: {
        flexDirection: 'row',
        backgroundColor: theme.colors.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        alignItems: 'center',
    },
    nodeCompleted: {
        borderColor: theme.colors.primary,
    },
    nodeActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.cardBackground,
    },
    nodeLocked: {
        borderColor: '#333',
        opacity: 0.7,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    nodeContent: {
        flex: 1,
    },
    nodeTitle: {
        fontSize: 18,
        fontFamily: theme.typography.fontFamily.bold,
        color: theme.colors.text,
        marginBottom: 4,
    },
    textLocked: {
        color: '#666',
    },
    nodeDescription: {
        fontSize: 14,
        color: theme.colors.textLight,
        marginBottom: 8,
    },
    nodeMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    difficulty: {
        fontSize: 12,
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    topics: {
        fontSize: 12,
        color: '#666',
    },
});

export default CurriculumScreen;
