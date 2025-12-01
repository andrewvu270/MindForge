import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';

const LearnScreen = ({ navigation }: { navigation: any }) => {
  const [fields] = useState([
    {
      id: 'tech',
      name: 'Technology',
      description: 'Latest in tech and AI',
      icon: '🤖',
      color: '#00FFF0',
      total_lessons: 62,
      progress: 45,
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Markets and investing',
      icon: '📈',
      color: '#FF6B35',
      total_lessons: 45,
      progress: 32,
    },
    {
      id: 'economics',
      name: 'Economics',
      description: 'Economic principles and trends',
      icon: '💰',
      color: '#00FF88',
      total_lessons: 38,
      progress: 20,
    },
    {
      id: 'culture',
      name: 'Culture',
      description: 'Arts and society',
      icon: '🌍',
      color: '#FF00FF',
      total_lessons: 28,
      progress: 15,
    },
    {
      id: 'influence',
      name: 'Influence Skills',
      description: 'Communication and leadership',
      icon: '💡',
      color: '#FFD700',
      total_lessons: 33,
      progress: 18,
    },
    {
      id: 'global',
      name: 'Global Events',
      description: 'World news and politics',
      icon: '🌐',
      color: '#00BFFF',
      total_lessons: 41,
      progress: 25,
    },
  ]);

  const renderFieldCard = (field: any) => (
    <TouchableOpacity
      key={field.id}
      style={[styles.fieldCard, { borderColor: field.color }]}
      onPress={() => navigation.navigate('Learn', { fieldId: field.id })}
    >
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldIcon}>{field.icon}</Text>
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldName}>{field.name}</Text>
          <Text style={styles.fieldDescription}>{field.description}</Text>
        </View>
      </View>
      
      <View style={styles.fieldStats}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {field.progress}/{field.total_lessons} lessons
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(field.progress / field.total_lessons) * 100}%`,
                  backgroundColor: field.color 
                }
              ]} 
            />
          </View>
        </View>
        <Text style={styles.percentageText}>
          {Math.round((field.progress / field.total_lessons) * 100)}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>📚 Learning Fields</Text>
        <Text style={styles.subtitle}>Choose your area of focus</Text>
        
        <View style={styles.fields}>
          {fields.map(renderFieldCard)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00FFF0',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  fields: {
    gap: 15,
  },
  fieldCard: {
    backgroundColor: '#252B3D',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  fieldIcon: {
    fontSize: 28,
    marginRight: 15,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 3,
  },
  fieldDescription: {
    fontSize: 13,
    color: '#999',
  },
  fieldStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginRight: 15,
  },
  progressText: {
    fontSize: 12,
    color: '#CCC',
    marginBottom: 5,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1A1F2E',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default LearnScreen;
