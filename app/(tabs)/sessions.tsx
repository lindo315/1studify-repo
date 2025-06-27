import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { Calendar, Clock, Video, MapPin, User, Phone, MessageCircle, Star, Award, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSessions } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import CreateSessionModal from '@/components/CreateSessionModal';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isTablet = width > 768;

export default function SessionsScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { sessions, loading, error, createSession, updateSession } = useSessions();

  // Filter sessions by status
  const upcomingSessions = sessions.filter(session => 
    session.status === 'scheduled' && new Date(session.scheduled_at) > new Date()
  );
  const completedSessions = sessions.filter(session => 
    session.status === 'completed' || 
    (session.status === 'scheduled' && new Date(session.scheduled_at) <= new Date())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleJoinSession = (session: any) => {
    if (session.type === 'video') {
      Alert.alert('Join Session', 'Opening video call...', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: () => console.log('Joining video session') }
      ]);
    } else {
      Alert.alert('Session Details', `Meeting at: ${session.location || 'Location TBD'}`);
    }
  };

  const handleReschedule = async (sessionId: string) => {
    Alert.alert('Reschedule Session', 'Choose a new time for your session', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reschedule', onPress: () => console.log('Rescheduling session:', sessionId) }
    ]);
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      await updateSession(sessionId, { status: 'completed' });
      Alert.alert('Session Completed', 'Session marked as completed!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update session status');
    }
  };

  const handleCreateSession = async (sessionData: any) => {
    try {
      await createSession(sessionData);
      setShowCreateModal(false);
      Alert.alert('Success', 'Session scheduled successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule session. Please try again.');
    }
  };

  const SessionCard = ({ session }: { session: any }) => {
    const isUpcoming = session.status === 'scheduled' && new Date(session.scheduled_at) > new Date();
    const studyPlan = session.study_plan;
    const otherUser = profile?.role === 'student' ? studyPlan?.tutor : studyPlan?.student;
    
    return (
      <TouchableOpacity 
        style={styles.sessionCard}
        onPress={() => setSelectedSession(session)}
        activeOpacity={0.8}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.sessionInfo}>
            <View style={styles.sessionTitleRow}>
              <Text style={styles.sessionSubject} numberOfLines={1}>
                {studyPlan?.title || studyPlan?.subject || 'Study Session'}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: isUpcoming ? '#10b981' : '#6b7280' }
              ]}>
                <Text style={styles.statusText}>
                  {session.status === 'completed' ? 'Completed' : 
                   session.status === 'cancelled' ? 'Cancelled' : 'Scheduled'}
                </Text>
              </View>
            </View>
            <Text style={styles.sessionTutor}>
              with {otherUser?.first_name || 'Unknown'} {otherUser?.last_name || 'User'}
            </Text>
            <Text style={styles.sessionSubject}>{studyPlan?.subject || 'General Study'}</Text>
          </View>
          <View style={styles.sessionAvatar}>
            <User size={isSmallScreen ? 20 : 24} color="#667eea" />
          </View>
        </View>

        <View style={styles.sessionDetails}>
          <View style={styles.sessionDetail}>
            <Calendar size={16} color="#667eea" />
            <Text style={styles.sessionDetailText}>
              {formatDate(session.scheduled_at)}
            </Text>
          </View>
          <View style={styles.sessionDetail}>
            <Clock size={16} color="#666" />
            <Text style={styles.sessionDetailText}>
              {formatTime(session.scheduled_at)} ({session.duration_minutes} min)
            </Text>
          </View>
          <View style={styles.sessionDetail}>
            {session.type === 'video' ? (
              <Video size={16} color="#10b981" />
            ) : (
              <MapPin size={16} color="#f59e0b" />
            )}
            <Text style={[
              styles.sessionDetailText,
              { color: session.type === 'video' ? '#10b981' : '#f59e0b' }
            ]}>
              {session.type === 'video' ? 'Video Call' : session.location || 'In Person'}
            </Text>
          </View>
        </View>

        {session.notes && (
          <View style={styles.notesSection}>
            <AlertCircle size={14} color="#f59e0b" />
            <Text style={styles.notesText}>{session.notes}</Text>
          </View>
        )}

        {isUpcoming && (
          <View style={styles.sessionActions}>
            <TouchableOpacity 
              style={styles.rescheduleButton}
              onPress={() => handleReschedule(session.id)}
              activeOpacity={0.7}
            >
              <Clock size={16} color="#666" />
              <Text style={styles.rescheduleButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.joinButton}
              onPress={() => handleJoinSession(session)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.joinButtonGradient}
              >
                {session.type === 'video' ? (
                  <Video size={16} color="#fff" />
                ) : (
                  <MapPin size={16} color="#fff" />
                )}
                <Text style={styles.joinButtonText}>
                  {session.type === 'video' ? 'Join Call' : 'View Location'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {session.status === 'completed' && (
          <View style={styles.completedSection}>
            <View style={styles.completedInfo}>
              <View style={styles.completedDetail}>
                <CheckCircle size={16} color="#10b981" />
                <Text style={styles.completedText}>
                  Duration: {session.duration_minutes} minutes
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.reviewButton}
              onPress={() => Alert.alert('Review', 'Review functionality coming soon!')}
              activeOpacity={0.7}
            >
              <Star size={16} color="#667eea" />
              <Text style={styles.reviewButtonText}>Leave Review</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const EmptyState = ({ type }: { type: 'upcoming' | 'completed' }) => (
    <View style={styles.emptyState}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.emptyStateGradient}>
        {type === 'upcoming' ? (
          <>
            <Calendar size={64} color="#fff" />
            <Text style={styles.emptyStateTitle}>No upcoming sessions</Text>
            <Text style={styles.emptyStateSubtitle}>
              Schedule a session with your matched tutors to get started
            </Text>
            <TouchableOpacity 
              style={styles.browseButton} 
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#fff" />
              <Text style={styles.browseButtonText}>Schedule Session</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Award size={64} color="#fff" />
            <Text style={styles.emptyStateTitle}>No completed sessions</Text>
            <Text style={styles.emptyStateSubtitle}>
              Your session history and achievements will appear here
            </Text>
          </>
        )}
      </LinearGradient>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingContainer}>
          <Calendar size={64} color="#fff" />
          <Text style={styles.loadingTitle}>Loading sessions...</Text>
          <Text style={styles.loadingSubtitle}>Getting your schedule ready</Text>
        </LinearGradient>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.loadingContainer}>
          <AlertCircle size={64} color="#fff" />
          <Text style={styles.loadingTitle}>Error loading sessions</Text>
          <Text style={styles.loadingSubtitle}>{error}</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Sessions</Text>
            <Text style={styles.headerSubtitle}>
              {upcomingSessions.length} upcoming • {completedSessions.length} completed
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => setShowCreateModal(true)}
            activeOpacity={0.8}
          >
            <Plus size={isSmallScreen ? 20 : 24} color="#667eea" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming ({upcomingSessions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed ({completedSessions.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[
          styles.contentContainer, 
          { paddingBottom: Math.max(insets.bottom + 100, 120) }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'upcoming' ? (
          <>
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))
            ) : (
              <EmptyState type="upcoming" />
            )}
          </>
        ) : (
          <>
            {completedSessions.length > 0 ? (
              completedSessions.map(session => (
                <SessionCard key={session.id} session={session} />
              ))
            ) : (
              <EmptyState type="completed" />
            )}
          </>
        )}
      </ScrollView>

      <CreateSessionModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateSession={handleCreateSession}
        userRole={profile?.role || 'student'}
      />
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
    margin: isSmallScreen ? 16 : 24,
    borderRadius: 24,
    padding: isSmallScreen ? 32 : 40,
  },
  loadingTitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  headerContainer: {
    backgroundColor: '#fff',
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: isSmallScreen ? 16 : 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: isSmallScreen ? 24 : 28,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: isSmallScreen ? 13 : 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    width: isSmallScreen ? 36 : 40,
    height: isSmallScreen ? 36 : 40,
    borderRadius: isSmallScreen ? 18 : 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: isSmallScreen ? 16 : 24,
    marginVertical: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  tabTextActive: {
    color: '#333',
    fontFamily: 'Inter-SemiBold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: isSmallScreen ? 16 : 24,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: isSmallScreen ? 16 : 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sessionInfo: {
    flex: 1,
    marginRight: 12,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sessionSubject: {
    fontSize: isSmallScreen ? 16 : 18,
    fontFamily: 'Inter-Bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  sessionTutor: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
    marginBottom: 4,
  },
  sessionAvatar: {
    width: isSmallScreen ? 40 : 44,
    height: isSmallScreen ? 40 : 44,
    backgroundColor: '#e5e7eb',
    borderRadius: isSmallScreen ? 20 : 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sessionDetailText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    marginBottom: 16,
  },
  notesText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#92400e',
    flex: 1,
    lineHeight: 18,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rescheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    gap: 6,
  },
  rescheduleButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  joinButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  joinButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  completedSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  completedInfo: {
    marginBottom: 12,
  },
  completedDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#10b981',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    gap: 6,
  },
  reviewButtonText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  emptyStateGradient: {
    alignItems: 'center',
    padding: isSmallScreen ? 32 : 40,
    borderRadius: 24,
    width: '100%',
  },
  emptyStateTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  browseButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});