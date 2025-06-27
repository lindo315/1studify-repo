import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Dimensions, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { User, Star, Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut, CreditCard as Edit3, Award, TrendingUp, Calendar, BookOpen, MessageCircle, Eye, ChevronRight, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStudyPlans, useSessions, useMatches } from '@/hooks/useSupabaseData';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isTablet = width > 768;

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showActivity, setShowActivity] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [studyReminders, setStudyReminders] = useState(true);

  // Get user stats from Supabase
  const { studyPlans } = useStudyPlans();
  const { sessions } = useSessions();
  const { matches } = useMatches();

  // Calculate stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.status === 'completed').length;
  const activePlans = studyPlans.filter(p => p.status === 'active').length;
  const completedPlans = studyPlans.filter(p => p.status === 'completed').length;
  const totalMatches = matches.filter(m => m.status === 'matched').length;

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          }
        }
      ]
    );
  };

  const ProfileSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ProfileItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent,
    showChevron = true,
    accentColor = '#667eea'
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    showChevron?: boolean;
    accentColor?: string;
  }) => (
    <TouchableOpacity 
      style={styles.profileItem} 
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.profileItemLeft}>
        <View style={[styles.profileItemIcon, { backgroundColor: `${accentColor}15` }]}>
          {icon}
        </View>
        <View style={styles.profileItemTextContainer}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.profileItemRight}>
        {rightComponent}
        {showChevron && onPress && <ChevronRight size={16} color="#ccc" />}
      </View>
    </TouchableOpacity>
  );

  const StatCard = ({ icon, label, value, color = '#667eea' }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (!profile) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingGradient}>
          <User size={48} color="#fff" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[
          styles.contentContainer, 
          { paddingBottom: Math.max(insets.bottom + 100, 120) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              {profile.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <User size={isSmallScreen ? 32 : 40} color="#667eea" />
                </View>
              )}
              <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
                <Edit3 size={14} color="#fff" />
              </TouchableOpacity>
              
              {/* Online status */}
              <View style={styles.onlineStatus}>
                <View style={styles.onlineDot} />
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{profile.first_name} {profile.last_name}</Text>
              <Text style={styles.email}>{profile.email}</Text>
              <View style={styles.roleContainer}>
                <Text style={styles.role}>
                  {profile.role === 'tutor' ? 'Tutor' : 'Student'}
                  {profile.major && ` • ${profile.major}`}
                </Text>
                {profile.verified && (
                  <View style={styles.verifiedBadge}>
                    <Star size={12} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
              {profile.university && (
                <Text style={styles.university}>{profile.university}</Text>
              )}
            </View>
            
            <TouchableOpacity style={styles.settingsButton} activeOpacity={0.7}>
              <Settings size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>{totalSessions}</Text>
              <Text style={styles.quickStatLabel}>Sessions</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>{profile.rating || '4.8'}</Text>
              <Text style={styles.quickStatLabel}>Rating</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>{activePlans}</Text>
              <Text style={styles.quickStatLabel}>Active Plans</Text>
            </View>
            <View style={styles.quickStatDivider} />
            <View style={styles.quickStat}>
              <Text style={styles.quickStatNumber}>{totalMatches}</Text>
              <Text style={styles.quickStatLabel}>Matches</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Detailed Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard 
            icon={<BookOpen size={20} color="#667eea" />}
            label="Study Plans"
            value={activePlans}
            color="#667eea"
          />
          <StatCard 
            icon={<Calendar size={20} color="#10b981" />}
            label="Completed"
            value={completedSessions}
            color="#10b981"
          />
          <StatCard 
            icon={<Award size={20} color="#f59e0b" />}
            label="Finished Plans"
            value={completedPlans}
            color="#f59e0b"
          />
          <StatCard 
            icon={<MessageCircle size={20} color="#ef4444" />}
            label="Connections"
            value={totalMatches}
            color="#ef4444"
          />
        </View>

        {/* Account Section */}
        <ProfileSection title="Account">
          <ProfileItem
            icon={<User size={20} color="#667eea" />}
            title="Edit Profile"
            subtitle="Update your information and preferences"
            onPress={() => router.push('/profile/edit')}
            accentColor="#667eea"
          />
          <ProfileItem
            icon={<Star size={20} color="#f59e0b" />}
            title="Reviews & Ratings"
            subtitle={`View feedback and ratings • ${profile.rating || '4.8'} avg rating`}
            onPress={() => router.push('/profile/reviews')}
            accentColor="#f59e0b"
          />
          <ProfileItem
            icon={<TrendingUp size={20} color="#10b981" />}
            title="Performance Analytics"
            subtitle="View your learning progress and insights"
            onPress={() => router.push('/profile/analytics')}
            accentColor="#10b981"
          />
          <ProfileItem
            icon={<Calendar size={20} color="#8b5cf6" />}
            title="Session History"
            subtitle={`${totalSessions} total sessions completed`}
            onPress={() => router.push('/profile/history')}
            accentColor="#8b5cf6"
          />
        </ProfileSection>

        {/* Preferences Section */}
        <ProfileSection title="Preferences">
          <ProfileItem
            icon={<Bell size={20} color="#667eea" />}
            title="Push Notifications"
            subtitle="Get notified about sessions and messages"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#e5e7eb', true: '#667eea' }}
                thumbColor={notificationsEnabled ? '#fff' : '#fff'}
                ios_backgroundColor="#e5e7eb"
              />
            }
            showChevron={false}
            accentColor="#667eea"
          />
          <ProfileItem
            icon={<Calendar size={20} color="#10b981" />}
            title="Study Reminders"
            subtitle="Daily reminders for your study sessions"
            rightComponent={
              <Switch
                value={studyReminders}
                onValueChange={setStudyReminders}
                trackColor={{ false: '#e5e7eb', true: '#10b981' }}
                thumbColor={studyReminders ? '#fff' : '#fff'}
                ios_backgroundColor="#e5e7eb"
              />
            }
            showChevron={false}
            accentColor="#10b981"
          />
          <ProfileItem
            icon={<Eye size={20} color="#8b5cf6" />}
            title="Dark Mode"
            subtitle="Switch to dark theme"
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: '#e5e7eb', true: '#8b5cf6' }}
                thumbColor={darkMode ? '#fff' : '#fff'}
                ios_backgroundColor="#e5e7eb"
              />
            }
            showChevron={false}
            accentColor="#8b5cf6"
          />
          <ProfileItem
            icon={<Settings size={20} color="#6b7280" />}
            title="Advanced Settings"
            subtitle="Customize your app experience"
            onPress={() => router.push('/settings')}
            accentColor="#6b7280"
          />
        </ProfileSection>

        {/* Activity Section */}
        <ProfileSection title="Recent Activity">
          <TouchableOpacity 
            style={styles.activityToggle}
            onPress={() => setShowActivity(!showActivity)}
            activeOpacity={0.7}
          >
            <View style={styles.activityToggleLeft}>
              <TrendingUp size={20} color="#667eea" />
              <Text style={styles.activityToggleText}>
                {showActivity ? 'Hide' : 'Show'} Recent Activity
              </Text>
            </View>
            <ChevronRight 
              size={16} 
              color="#ccc" 
              style={[
                styles.activityChevron,
                showActivity && styles.activityChevronRotated
              ]}
            />
          </TouchableOpacity>
          
          {showActivity && (
            <View style={styles.activityList}>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <BookOpen size={16} color="#667eea" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityDescription}>
                    {profile.role === 'student' ? 'Joined study session' : 'Completed tutoring session'}
                  </Text>
                  <Text style={styles.activityTime}>Recently</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Award size={16} color="#f59e0b" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityDescription}>Profile verified</Text>
                  <Text style={styles.activityTime}>This week</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Star size={16} color="#10b981" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityDescription}>
                    {profile.role === 'student' ? 'Left positive review' : 'Received 5-star rating'}
                  </Text>
                  <Text style={styles.activityTime}>Last week</Text>
                </View>
              </View>
            </View>
          )}
        </ProfileSection>

        {/* Support Section */}
        <ProfileSection title="Support & Legal">
          <ProfileItem
            icon={<Shield size={20} color="#10b981" />}
            title="Privacy & Safety"
            subtitle="Manage your privacy settings and safety tools"
            onPress={() => router.push('/privacy')}
            accentColor="#10b981"
          />
          <ProfileItem
            icon={<HelpCircle size={20} color="#667eea" />}
            title="Help Center"
            subtitle="Get support and find answers to common questions"
            onPress={() => router.push('/help')}
            accentColor="#667eea"
          />
        </ProfileSection>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <View style={styles.logoutButtonContent}>
              <LogOut size={20} color="#ef4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0 • Build 2024.1.1</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 40,
  },
  loadingGradient: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 24,
    width: '100%',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    marginTop: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 0,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: isSmallScreen ? 16 : 24,
    marginBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: isSmallScreen ? 70 : 80,
    height: isSmallScreen ? 70 : 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: isSmallScreen ? 35 : 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarImage: {
    width: isSmallScreen ? 70 : 80,
    height: isSmallScreen ? 70 : 80,
    borderRadius: isSmallScreen ? 35 : 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 28,
    height: 28,
    backgroundColor: '#667eea',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  onlineStatus: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  onlineDot: {
    width: 12,
    height: 12,
    backgroundColor: '#10b981',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: isSmallScreen ? 20 : 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.9)',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#fbbf24',
  },
  university: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.7)',
  },
  settingsButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 16,
    borderRadius: 16,
  },
  quickStat: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatNumber: {
    fontSize: isSmallScreen ? 16 : 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  quickStatLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: isSmallScreen ? 16 : 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - (isSmallScreen ? 44 : 60)) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    marginHorizontal: isSmallScreen ? 16 : 24,
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileItemTextContainer: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  profileItemSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
    lineHeight: 18,
  },
  profileItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  activityToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityToggleText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
  },
  activityChevron: {
    transform: [{ rotate: '0deg' }],
  },
  activityChevronRotated: {
    transform: [{ rotate: '90deg' }],
  },
  activityList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#f8f9fa',
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  logoutSection: {
    marginHorizontal: isSmallScreen ? 16 : 24,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ef4444',
  },
  version: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: isSmallScreen ? 16 : 24,
  },
});