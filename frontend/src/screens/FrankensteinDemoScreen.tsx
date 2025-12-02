import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { apiService } from '../services/api';

export default function FrankensteinDemoScreen() {
  const [field, setField] = useState('technology');
  const [topic, setTopic] = useState('artificial intelligence');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateLesson = async () => {
    setLoading(true);
    setError(null);
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
    } catch (err: any) {
      setError(err.message || 'Failed to generate lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Frankenstein Demo</Text>
        <Text style={styles.subtitle}>
          Generate lessons from multiple sources
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Field:</Text>
        <TextInput
          style={styles.input}
          value={field}
          onChangeText={setField}
          placeholder="e.g., technology, finance, culture"
        />

        <Text style={styles.label}>Topic:</Text>
        <TextInput
          style={styles.input}
          value={topic}
          onChangeText={setTopic}
          placeholder="e.g., artificial intelligence"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={generateLesson}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Generate Lesson</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>✅ Lesson Generated!</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 {result.lesson.title}</Text>
            <Text style={styles.summary}>{result.lesson.summary}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Learning Objectives:</Text>
            {result.lesson.learning_objectives?.map((obj: string, i: number) => (
              <Text key={i} style={styles.listItem}>
                • {obj}
              </Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔑 Key Concepts:</Text>
            {result.lesson.key_concepts?.map((concept: string, i: number) => (
              <Text key={i} style={styles.listItem}>
                • {concept}
              </Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📡 Sources ({result.metadata.num_sources}):
            </Text>
            {result.lesson.sources?.map((source: any, i: number) => (
              <Text key={i} style={styles.sourceItem}>
                {i + 1}. {source.name}: {source.title}
              </Text>
            ))}
          </View>

          {result.quiz && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                ❓ Quiz ({result.quiz.questions?.length} questions):
              </Text>
              {result.quiz.questions?.map((q: any, i: number) => (
                <View key={i} style={styles.quizQuestion}>
                  <Text style={styles.questionText}>
                    Q{i + 1}: {q.question}
                  </Text>
                  {q.options?.map((opt: string, j: number) => (
                    <Text key={j} style={styles.optionText}>
                      {opt}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#6366f1',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
  },
  form: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  resultContainer: {
    margin: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
  },
  summary: {
    fontSize: 14,
    lineHeight: 22,
    color: '#4b5563',
  },
  listItem: {
    fontSize: 14,
    lineHeight: 24,
    color: '#4b5563',
    marginLeft: 8,
  },
  sourceItem: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6b7280',
    marginBottom: 4,
  },
  quizQuestion: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  optionText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6b7280',
    marginLeft: 16,
  },
});
