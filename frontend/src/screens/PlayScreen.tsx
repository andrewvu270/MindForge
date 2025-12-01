import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const PlayScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>🎯 Play & Predict</Text>
        <Text style={styles.subtitle}>Test your knowledge</Text>
        
        <View style={styles.challenges}>
          <View style={styles.challengeCard}>
            <Text style={styles.challengeTitle}>📊 Market Prediction</Text>
            <Text style={styles.challengeDesc}>Will Tesla hit $300 by Friday?</Text>
            <Text style={styles.challengeReward}>🏆 250 points</Text>
            <TouchableOpacity style={styles.playButton}>
              <Text style={styles.playButtonText}>Play Now</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.challengeCard}>
            <Text style={styles.challengeTitle}>🤖 Tech Quiz</Text>
            <Text style={styles.challengeDesc}>AI & Machine Learning Basics</Text>
            <Text style={styles.challengeReward}>🏆 150 points</Text>
            <TouchableOpacity style={styles.playButton}>
              <Text style={styles.playButtonText}>Start Quiz</Text>
            </TouchableOpacity>
          </View>
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
  challenges: {
    gap: 20,
  },
  challengeCard: {
    backgroundColor: '#252B3D',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  challengeDesc: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 12,
  },
  challengeReward: {
    fontSize: 12,
    color: '#00FF88',
    marginBottom: 15,
  },
  playButton: {
    backgroundColor: '#00FFF0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#0A0E27',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PlayScreen;
