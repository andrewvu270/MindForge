import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const StatsScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>📊 Your Progress</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>2,450</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>89</Text>
            <Text style={styles.statLabel}>Lessons Done</Text>
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Knowledge Matrix</Text>
          
          <View style={styles.progressBar}>
            <Text style={styles.progressLabel}>Tech</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '85%', backgroundColor: '#00FFF0' }]} />
            </View>
            <Text style={styles.progressPercent}>85%</Text>
          </View>
          
          <View style={styles.progressBar}>
            <Text style={styles.progressLabel}>Finance</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '65%', backgroundColor: '#FF6B35' }]} />
            </View>
            <Text style={styles.progressPercent}>65%</Text>
          </View>
          
          <View style={styles.progressBar}>
            <Text style={styles.progressLabel}>Culture</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '45%', backgroundColor: '#00FF88' }]} />
            </View>
            <Text style={styles.progressPercent}>45%</Text>
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
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#252B3D',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFF0',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  progressLabel: {
    width: 60,
    fontSize: 14,
    color: '#CCC',
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#1A1F2E',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    width: 40,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
});

export default StatsScreen;
