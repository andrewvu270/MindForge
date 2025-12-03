import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../services/api';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function SimpleFrankensteinScreen({ navigation }: any) {
  const [field, setField] = useState('technology');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [loading]);

  const generateLesson = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await apiService.generateLesson({
        field,
        topic,
        num_sources: 3,
        generate_quiz: true,
        num_quiz_questions: 3,
      });
      setResult(response);
    } catch (error) {
      console.error('Error generating lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const fieldOptions = [
    { value: 'technology', emoji: '💻', gradient: ['#667eea', '#764ba2'] },
    { value: 'finance', emoji: '💰', gradient: ['#f093fb', '#f5576c'] },
    { value: 'economics', emoji: '📊', gradient: ['#4facfe', '#00f2fe'] },
    { value: 'culture', emoji: '🎨', gradient: ['#43e97b', '#38f9d7'] },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text style={styles.headerEmoji}>🧪</Text>
          <Text style={styles.headerTitle}>AI Lesson Generator</Text>
          <Text style={styles.headerSubtitle}>Create custom lessons from multiple sources</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="grid-outline" size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>Select Field</Text>
            </View>
            <View style={styles.fieldGrid}>
              {fieldOptions.map((option) => {
                const isSelected = field === option.value;
                const scaleAnim = useRef(new Animated.Value(1)).current;

                const handlePressIn = () => {
                  Animated.spring(scaleAnim, {
                    toValue: 0.95,
                    useNativeDriver: true,
                  }).start();
                };

                const handlePressOut = () => {
                  Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 3,
                    tension: 40,
                    useNativeDriver: true,
                  }).start();
                };

                return (
                  <AnimatedTouchable
                    key={option.value}
                    style={[
                      styles.fieldCard,
                      { transform: [{ scale: scaleAnim }] },
                    ]}
                    onPress={() => setField(option.value)}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                  >
                    <LinearGradient
                      colors={isSelected ? option.gradient : ['#f8f9fa', '#f8f9fa']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.fieldCardGradient}
                    >
                      <Text style={styles.fieldEmoji}>{option.emoji}</Text>
                      <Text
                        style={[
                          styles.fieldText,
                          isSelected && styles.fieldTextSelected,
                        ]}
                      >
                        {option.value}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        </View>
                      )}
                    </LinearGradient>
                  </AnimatedTouchable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="create-outline" size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>Enter Topic</Text>
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="search-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={topic}
                onChangeText={setTopic}
                placeholder="e.g., artificial intelligence, blockchain..."
                placeholderTextColor="#999"
                returnKeyType="done"
                onSubmitEditing={generateLesson}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.generateButton,
              (!topic.trim() || loading) && styles.generateButtonDisabled,
            ]}
            onPress={generateLesson}
            disabled={!topic.trim() || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                topic.trim() && !loading
                  ? ['#667eea', '#764ba2']
                  : ['#e0e0e0', '#e0e0e0']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateButtonGradient}
            >
              {loading ? (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <ActivityIndicator color="#fff" size="small" />
                </Animated.View>
              ) : (
                <>
                  <Ionicons name="flash" size={24} color="#fff" />
                  <Text style={styles.generateButtonText}>Generate Lesson</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingCard}>
              <Text style={styles.loadingEmoji}>✨</Text>
              <Text style={styles.loadingText}>Creating your custom lesson...</Text>
              <Text style={styles.loadingSubtext}>Gathering insights from multiple sources</Text>
            </View>
          )}

          {result && !loading && (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultEmoji}>🎉</Text>
                  <Text style={styles.resultHeaderText}>Lesson Generated!</Text>
                </View>

                <Text style={styles.resultTitle}>{result.lesson.title}</Text>
                <Text style={styles.resultSummary}>{result.lesson.summary}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statBadge}>
                    <Ionicons name="document-text" size={18} color="#667eea" />
                    <Text style={styles.statText}>{result.metadata.num_sources} sources</Text>
                  </View>
                  {result.quiz && (
                    <View style={styles.statBadge}>
                      <Ionicons name="help-circle" size={18} color="#f093fb" />
                      <Text style={styles.statText}>{result.quiz.questions?.length} questions</Text>
                    </View>
                  )}
                </View>

                {result.lesson.sources && result.lesson.sources.length > 0 && (
                  <View style={styles.sourcesSection}>
                    <Text style={styles.sourcesTitle}>📚 Sources</Text>
                    {result.lesson.sources.map((source: any, i: number) => (
                      <View key={i} style={styles.sourceItem}>
                        <View style={styles.sourceDot} />
                        <View style={styles.sourceContent}>
                          <Text style={styles.sourceName}>{source.name}</Text>
                          <Text style={styles.sourceTitle} numberOfLines={2}>
                            {source.title}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {result.quiz && result.quiz.questions && result.quiz.questions.length > 0 && (
                  <View style={styles.quizSection}>
                    <Text style={styles.quizTitle}>📝 Quiz Preview</Text>
                    {result.quiz.questions.slice(0, 2).map((q: any, i: number) => (
                      <View key={i} style={styles.quizPreviewItem}>
                        <Text style={styles.quizNumber}>Q{i + 1}</Text>
                        <Text style={styles.quizQuestion} numberOfLines={2}>
                          {q.question}
                        </Text>
                      </View>
                    ))}
                    {result.quiz.questions.length > 2 && (
                      <Text style={styles.moreQuestions}>
                        +{result.quiz.questions.length - 2} more questions
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  headerEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fieldCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  fieldCardGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    position: 'relative',
  },
  fieldEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  fieldText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'capitalize',
  },
  fieldTextSelected: {
    color: '#fff',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#2c3e50',
  },
  generateButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  generateButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  resultEmoji: {
    fontSize: 32,
  },
  resultHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    lineHeight: 30,
  },
  resultSummary: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  sourcesSection: {
    marginBottom: 24,
  },
  sourcesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  sourceItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 8,
  },
  sourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#667eea',
    marginTop: 6,
    marginRight: 12,
  },
  sourceContent: {
    flex: 1,
  },
  sourceName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 2,
  },
  sourceTitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  quizSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  quizPreviewItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  quizNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
    minWidth: 28,
  },
  quizQuestion: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  moreQuestions: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
