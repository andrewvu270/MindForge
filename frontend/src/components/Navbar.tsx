import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';

export default function Navbar() {
  const navigation = useNavigation();
  const route = useRoute();
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    AsyncStorage.getItem('mindforge_user').then((stored) => {
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  const navItems = [
    { to: 'Dashboard', label: 'Home', icon: 'home-outline' },
    { to: 'Lessons', label: 'Lessons', icon: 'library-outline' },
    { to: 'Flashcards', label: 'Flashcards', icon: 'layers-outline' },
    { to: 'Reflection', label: 'Reflect', icon: 'create-outline' },
    { to: 'Progress', label: 'Progress', icon: 'bar-chart-outline' },
  ];

  const isActive = (screenName: string) => route.name === screenName;

  const handleLogout = async () => {
    await AsyncStorage.removeItem('mindforge_user');
    setShowMenu(false);
    navigation.navigate('Landing' as never);
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard' as never)}>
          <Text style={styles.logo}>mindforge</Text>
        </TouchableOpacity>

        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={() => navigation.navigate('Generate' as never)}
          >
            <Ionicons name="add" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.userButton}
            onPress={() => setShowMenu(true)}
          >
            <Text style={styles.userInitial}>{userInitial}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mobile Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMenu(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          <Pressable style={styles.menuContainer} onPress={(e) => e.stopPropagation()}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* User Profile Section */}
              <View style={styles.userProfile}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{userInitial}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user?.name || 'User'}</Text>
                  <Text style={styles.userEmail} numberOfLines={1}>
                    {user?.email}
                  </Text>
                </View>
              </View>

              {/* Navigation Items */}
              <View style={styles.menuItems}>
                {navItems.map((item) => (
                  <TouchableOpacity
                    key={item.to}
                    style={[
                      styles.menuItem,
                      isActive(item.to) && styles.menuItemActive,
                    ]}
                    onPress={() => {
                      navigation.navigate(item.to as never);
                      setShowMenu(false);
                    }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={
                        isActive(item.to)
                          ? '#FFFFFF'
                          : theme.colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.menuItemText,
                        isActive(item.to) && styles.menuItemTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    navigation.navigate('Generate' as never);
                    setShowMenu(false);
                  }}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={theme.colors.textMuted}
                  />
                  <Text style={styles.menuItemText}>Generate Lesson</Text>
                </TouchableOpacity>

                {/* Sign Out Button */}
                <TouchableOpacity
                  style={styles.signOutButton}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={20} color={theme.colors.coral} />
                  <Text style={styles.signOutText}>Sign out</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: `${theme.colors.cardBackgroundAlt}CC`,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  logo: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.charcoal,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  generateButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  userButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '80%',
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.bgGradientDark,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.coral,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  userAvatarText: {
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.charcoal,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  menuItems: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.sm,
  },
  menuItemActive: {
    backgroundColor: theme.colors.charcoal,
  },
  menuItemText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textMuted,
  },
  menuItemTextActive: {
    color: '#FFFFFF',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  signOutText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.coral,
  },
});
