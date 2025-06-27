import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { useState } from 'react';
import { Plus, Target, Clock, CircleCheck as CheckCircle, TrendingUp, Calendar, User, BookOpen, Award, Zap, Star, TriangleAlert as AlertTriangle, Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProgressRing from '@/components/ProgressRing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStudyPlans } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import CreateStudyPlanModal from '@/components/CreateStudyPlanModal';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isTablet = width > 768;

export default function StudyPlansScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const { studyPlans, loading, error, createStudyPlan, updateStudyPlan } = useStudyPlans();

  // Filter plans by status
  const activePlans = studyPlans.filter(plan => plan.status === 'active');
  const completedPlans = studyPlans.filter(plan => plan.status === 'completed');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'advanced': return '#8b5cf6';
      case 'intermediate': return '#06b6d4';
      case 'beginner': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    return `${Math.ceil(diffDays / 7)} weeks left`;
  };

  const handleCreatePlan = async (planData: any) => {
    try {
      await createStudyPlan({
        ...planData,
        student_id: profile?.role === 'student' ? profile.id : planData.student_id,
        tutor_id: profile?.role === 'tutor' ? profile.id : planData.tutor_id,
      });
      setShowCreateModal(false);
      Alert.alert('Success', 'Study plan created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create study plan. Please try again.');
    }
  };

  const handleUpdateProgress = async (planId: string, newProgress: number) => {
    try {
      await updateStudyPlan(planId, { progress: newProgress });
      Alert.alert('Success', 'Progress updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update progress. Please try again.');
    }
  };

  const StudyPlanCard = ({ plan }: { plan: any }) => {
    const goals = Array.isArray(plan.goals) ? plan.goals : [];
    const isUrgent = plan.due_date && new Date(plan.due_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    return (
      <TouchableOpacity 
        style={[
          styles.planCard,
          isUrgent && styles.urgentCard
        ]}
        onPress={() => setSelectedPlan(plan)}
        activeOpacity={0.8}
      >
        <View style={styles.planHeader}>
          <View style={styles.planInfo}>
            <View style={styles.planTitleRow}>
              <Text style={styles.planTitle} numberOfLines={2}>{plan.title}</Text>
              <View style={styles.badgeContainer}>
                {isUrgent && (
                  <View style={[styles.priorityBadge, { backgroundColor: '#ef4444' }]}>
                    <Text style={styles.priorityText}>urgent</Text>
                  </View>
                )}
                
                <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(plan.difficulty_level) }]}>
                  <Text style={styles.difficultyText}>{plan.difficulty_level || 'Intermediate'}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.planSubject}>{plan.subject}</Text>
            <View style={styles.tutorInfo}>
              <User size={14} color="#666" />
              <Text style={styles.planTutor}>
                {profile?.role === 'student' 
                  ? `${plan.tutor?.first_name || 'Unknown'} ${plan.tutor?.last_name || 'Tutor'}`
                  : `${plan.student?.first_name || 'Unknown'} ${plan.student?.last_name || 'Student'}`
                }
              </Text>
              <View style={styles.streakInfo}>
                <Zap size={12} color="#f59e0b" />
                <Text style={styles.streakText}>Active</Text>
              </View>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <ProgressRing progress={plan.progress} size={isSmallScreen ? 60 : 70} />
          </View>
        </View>

        <View style={styles.planStats}>
          <View style={styles.statGrid}>
            <View style={styles.stat}>
              <Clock size={14} color="#667eea" />
              <Text style={styles.statLabel}>Progress</Text>
              <Text style={styles.statValue}>{plan.progress}%</Text>
            </View>
            <View style={styles.stat}>
              <BookOpen size={14} color="#10b981" />
              <Text style={styles.statLabel}>Subject</Text>
              <Text style={styles.statValue}>{plan.subject}</Text>
            </View>
            <View style={styles.stat}>
              <Calendar size={14} color="#f59e0b" />
              <Text style={styles.statLabel}>Due</Text>
              <Text style={[
                styles.statValue,
                { color: isUrgent ? '#ef4444' : '#666' }
              ]}>
                {plan.due_date ? formatTimeRemaining(plan.due_date) : 'No deadline'}
              </Text>
            </View>
          </View>
        </View>

        {plan.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {plan.description}
            </Text>
          </View>
        )}

        <View style={styles.goals}>
          <Text style={styles.goalsTitle}>Goals</Text>
          <View style={styles.goalsList}>
            {goals.slice(0, 2).map((goal: string, index: number) => (
              <View key={index} style={styles.goal}>
                <View style={styles.goalBullet} />
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
            {goals.length > 2 && (
              <Text style={styles.moreGoals}>+{goals.length - 2} more goals</Text>
            )}
            {goals.length === 0 && (
              <Text style={styles.noGoals}>No goals set yet</Text>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.nextSessionInfo}>
            <Target size={14} color="#667eea" />
            <Text style={styles.nextSessionText}>
              Created {new Date(plan.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.lastActivity}>
            Updated {new Date(plan.updated_at).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.planActions}>
          <TouchableOpacity 
            style={styles.progressButton}
            onPress={() => {
              const newProgress = Math.min(plan.progress + 10, 100);
              handleUpdateProgress(plan.id, newProgress);
            }}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#667eea" />
            <Text style={styles.progressButtonText}>Update Progress</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.viewPlanButton} activeOpacity={0.8}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.viewPlanGradient}>
              <TrendingUp size={16} color="#fff" />
              <Text style={styles.viewPlanButtonText}>View Details</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const CompletedPlanCard = ({ plan }: { plan: any }) => (
    <TouchableOpacity style={styles.completedPlanCard} activeOpacity={0.8}>
      <View style={styles.completedPlanHeader}>
        <View style={styles.planInfo}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <Text style={styles.planSubject}>{plan.subject}</Text>
          <View style={styles.tutorInfo}>
            <User size={14} color="#666" />
            <Text style={styles.planTutor}>
              {profile?.role === 'student' 
                ? `${plan.tutor?.first_name || 'Unknown'} ${plan.tutor?.last_name || 'Tutor'}`
                : `${plan.student?.first_name || 'Unknown'} ${plan.student?.last_name || 'Student'}`
              }
            </Text>
          </View>
        </View>
        <View style={styles.completedBadge}>
          <CheckCircle size={20} color="#10b981" />
          <Text style={styles.completedBadgeText}>Completed</Text>
        </View>
      </View>

      <View style={styles.completedStats}>
        <View style={styles.completedStat}>
          <Text style={styles.completedStatLabel}>Progress</Text>
          <Text style={styles.completedStatValue}>{plan.progress}%</Text>
        </View>
        <View style={styles.completedStat}>
          <Text style={styles.completedStatLabel}>Subject</Text>
          <Text style={styles.completedStatValue}>{plan.subject}</Text>
        </View>
        <View style={styles.completedStat}>
          <Text style={styles.completedStatLabel}>Duration</Text>
          <Text style={styles.completedStatValue}>
            {Math.ceil((new Date(plan.updated_at).getTime() - new Date(plan.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
          </Text>
        </View>
      </View>

      {plan.description && (
        <View style={styles.completedDescription}>
          <Text style={styles.completedDescriptionText}>{plan.description}</Text>
        </View>
      )}

      <Text style={styles.completedDate}>
        Completed on {new Date(plan.updated_at).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.loadingContainer}>
          <BookOpen size={64} color="#fff" />
          <Text style={styles.loadingTitle}>Loading study plans...</Text>
          <Text style={styles.loadingSubtitle}>Getting your learning journey ready</Text>
        </LinearGradient>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.loadingContainer}>
          <AlertTriangle size={64} color="#fff" />
          <Text style={styles.loadingTitle}>Error loading plans</Text>
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
            <Text style={styles.headerTitle}>Study Plans</Text>
            <Text style={styles.headerSubtitle}>
              {activePlans.length} active • {completedPlans.length} completed
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(!showFilters)}
              activeOpacity={0.7}
            >
              <Filter size={isSmallScreen ? 18 : 20} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setShowCreateModal(true)}
              activeOpacity={0.8}
            >
              <Plus size={isSmallScreen ? 20 : 24} color="#667eea" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active Plans ({activePlans.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed ({completedPlans.length})
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
        {activeTab === 'active' ? (
          <>
            {/* Quick Stats */}
            {activePlans.length > 0 && (
              <View style={styles.quickStats}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.quickStatsGradient}>
                  <View style={styles.quickStat}>
                    <Text style={styles.quickStatNumber}>
                      {activePlans.length}
                    </Text>
                    <Text style={styles.quickStatLabel}>Active Plans</Text>
                  </View>
                  <View style={styles.quickStatDivider} />
                  <View style={styles.quickStat}>
                    <Text style={styles.quickStatNumber}>
                      {Math.round(activePlans.reduce((acc, plan) => acc + plan.progress, 0) / activePlans.length) || 0}%
                    </Text>
                    <Text style={styles.quickStatLabel}>Avg Progress</Text>
                  </View>
                  <View style={styles.quickStatDivider} />
                  <View style={styles.quickStat}>
                    <Text style={styles.quickStatNumber}>
                      {activePlans.filter(plan => plan.due_date && new Date(plan.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length}
                    </Text>
                    <Text style={styles.quickStatLabel}>Due Soon</Text>
                  </View>
                </LinearGradient>
              </View>
            )}

            {activePlans.length > 0 ? (
              activePlans.map(plan => (
                <StudyPlanCard key={plan.id} plan={plan} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.emptyStateGradient}>
                  <BookOpen size={64} color="#fff" />
                  <Text style={styles.emptyStateTitle}>No active study plans</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Create your first study plan to start tracking your learning progress
                  </Text>
                  <TouchableOpacity 
                    style={styles.createButton} 
                    onPress={() => setShowCreateModal(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.createButtonText}>Create Study Plan</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
          </>
        ) : (
          <>
            {completedPlans.length > 0 ? (
              completedPlans.map(plan => (
                <CompletedPlanCard key={plan.id} plan={plan} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <LinearGradient colors={['#667eea', '#764ba2']} style={styles.emptyStateGradient}>
                  <CheckCircle size={64} color="#fff" />
                  <Text style={styles.emptyStateTitle}>No completed plans yet</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Your finished study plans and achievements will appear here
                  </Text>
                </LinearGradient>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <CreateStudyPlanModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePlan={handleCreatePlan}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
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
  addButton: {
    width: isSmallScreen ? 40 : 44,
    height: isSmallScreen ? 40 : 44,
    backgroundColor: '#f8f9fa',
    borderRadius: isSmallScreen ? 20 : 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
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
  quickStats: {
    marginBottom: 20,
  },
  quickStatsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
    borderRadius: 20,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: isSmallScreen ? 20 : 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  quickStatLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  quickStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  planCard: {
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
    shadowRadius: 16,
    elevation: 8,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planInfo: {
    flex: 1,
    marginRight: 16,
  },
  planTitleRow: {
    marginBottom: 8,
  },
  planTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    textTransform: 'uppercase',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  planSubject: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
    marginBottom: 6,
  },
  tutorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planTutor: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginRight: 12,
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbeb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: '#92400e',
  },
  progressContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  planStats: {
    marginBottom: 16,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#999',
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  descriptionSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  goals: {
    marginBottom: 16,
  },
  goalsTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  goalsList: {
    gap: 4,
  },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalBullet: {
    width: 6,
    height: 6,
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  goalText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    flex: 1,
  },
  moreGoals: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
    marginTop: 4,
    marginLeft: 14,
  },
  noGoals: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#999',
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nextSessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextSessionText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
  },
  lastActivity: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: '#999',
  },
  planActions: {
    flexDirection: 'row',
    gap: 12,
  },
  progressButton: {
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
  progressButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
  },
  viewPlanButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewPlanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  viewPlanButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  // Completed Plans Styles
  completedPlanCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: isSmallScreen ? 16 : 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  completedPlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#10b981',
  },
  completedStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
  },
  completedStat: {
    alignItems: 'center',
    flex: 1,
  },
  completedStatLabel: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: '#999',
    marginBottom: 4,
  },
  completedStatValue: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  completedDescription: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  completedDescriptionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  completedDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  emptyState: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyStateGradient: {
    padding: isSmallScreen ? 28 : 32,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});