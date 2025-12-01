import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const ProfileScreen = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.profileName}>Alex Chen</Text>
          <Text style={styles.profileTitle}>Level 12 • Knowledge Architect</Text>
        </View>
        
        <View style={styles.achievements}>
          <Text style={styles.sectionTitle}>🏆 Recent Achievements</Text>
          
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>⚡</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Market Prophet</Text>
              <Text style={styles.achievementDesc}>Predicted 7/10 market moves</Text>
            </View>
          </View>
          
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>📚</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Tech Expert</Text>
              <Text style={styles.achievementDesc}>Completed 50+ tech lessons</Text>
            </View>
          </View>
          
          <View style={styles.achievementCard}>
            <Text style={styles.achievementIcon}>🔥</Text>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Week Warrior</Text>
              <Text style={styles.achievementDesc}>7-day learning streak</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.leaderboard}>
          <Text style={styles.sectionTitle}>📈 Leaderboard</Text>
          
          <View style={styles.leaderboardItem}>
            <Text style={styles.rank}>#1</Text>
            <Text style={styles.playerName}>Sarah</Text>
            <Text style={styles.playerScore}>3,200 pts</Text>
          </View>
          
          <View style={[styles.leaderboardItem, styles.currentUser]}>
            <Text style={styles.rank}>#2</Text>
            <Text style={styles.playerName}>You</Text>
            <Text style={styles.playerScore}>2,450 pts</Text>
          </View>
          
          <View style={styles.leaderboardItem}>
            <Text style={styles.rank}>#3</Text>
            <Text style={styles.playerName}>Mike</Text>
            <Text style={styles.playerScore}>2,100 pts</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#252B3D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00FFF0',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  profileTitle: {
    fontSize: 14,
    color: '#666',
  },
  achievements: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252B3D',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 3,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666',
  },
  leaderboard: {
    marginBottom: 30,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252B3D',
  },
  currentUser: {
    backgroundColor: '#252B3D',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  rank: {
    width: 30,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00FFF0',
  },
  playerName: {
    flex: 1,
    fontSize: 14,
    color: '#CCC',
  },
  playerScore: {
    fontSize: 14,
    color: '#666',
  },
  settingsButton: {
    backgroundColor: '#1A1F2E',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  settingsButtonText: {
    color: '#CCC',
    fontSize: 14,
  },
});

export default ProfileScreen;
