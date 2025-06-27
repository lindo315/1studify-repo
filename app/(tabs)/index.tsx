import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, Alert, ScrollView, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { X, Heart, Star, MapPin, Clock, MessageCircle, Zap, Filter, Settings, Sparkles, Award, Users, ChevronDown, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTutors, useMatches } from '@/hooks/useSupabaseData';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isTablet = width > 768;

// Responsive card sizing
const CARD_WIDTH = isTablet 
  ? Math.min(width - 80, 400) 
  : Math.min(width - (isSmallScreen ? 40 : 60), 340);
const CARD_HEIGHT = isTablet 
  ? Math.min(height * 0.65, 600) 
  : Math.min(height * 0.58, 520);

export default function DiscoverScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [filters, setFilters] = useState({
    subjects: [] as string[],
    verified: false,
    minRating: 0,
    maxPrice: 200
  });
  
  // Use Supabase data
  const { tutors, loading: tutorsLoading, error: tutorsError } = useTutors();
  const { matches, createMatch, updateMatchStatus } = useMatches();
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const isStudent = profile?.role === 'student';
  
  // Apply simple filtering
  const filteredTutors = tutors.filter(tutor => {
    if (filters.verified && !tutor.verified) return false;
    if (filters.minRating > 0 && (tutor.rating || 0) < filters.minRating) return false;
    if (tutor.hourly_rate && tutor.hourly_rate > filters.maxPrice) return false;
    return true;
  });

  const currentTutor = isStudent && filteredTutors.length > 0 ? filteredTutors[currentIndex] : null;

  const onSwipe = async (direction: 'left' | 'right') => {
    if (direction === 'right' && currentTutor && isStudent) {
      try {
        await createMatch(currentTutor.id);
        setShowMatchModal(true);
        setTimeout(() => setShowMatchModal(false), 2500);
      } catch (error) {
        console.error('Error creating match:', error);
        Alert.alert('Error', 'Failed to create match. Please try again.');
      }
    }
    
    if (currentIndex < filteredTutors.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(0.95);
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = event.translationX * 0.05;
      
      const swipeProgress = Math.abs(event.translationX) / (width * 0.4);
      opacity.value = interpolate(
        swipeProgress,
        [0, 1],
        [1, 0.8],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      const shouldSwipe = Math.abs(event.translationX) > width * 0.25;
      
      if (shouldSwipe) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        translateX.value = withTiming(event.translationX > 0 ? width : -width, { duration: 250 });
        opacity.value = withTiming(0, { duration: 250 });
        
        setTimeout(() => {
          runOnJS(onSwipe)(direction);
          translateX.value = 0;
          translateY.value = 0;
          rotate.value = 0;
          scale.value = withSpring(1);
          opacity.value = withSpring(1);
        }, 250);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
        scale.value = withSpring(1);
        opacity.value = withSpring(1);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const handleLike = () => {
    translateX.value = withTiming(width, { duration: 250 });
    opacity.value = withTiming(0, { duration: 250 });
    setTimeout(() => {
      onSwipe('right');
    }, 250);
  };

  const handleReject = () => {
    translateX.value = withTiming(-width, { duration: 250 });
    opacity.value = withTiming(0, { duration: 250 });
    setTimeout(() => {
      onSwipe('left');
    }, 250);
  };

  const handleResetFilters = () => {
    setFilters({
      subjects: [],
      verified: false,
      minRating: 0,
      maxPrice: 200
    });
    setCurrentIndex(0);
  };

  const handleRefresh = () => {
    setCurrentIndex(0);
    // In a real app, this would refetch data
  };

  // Loading state
  if (tutorsLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <RefreshCw size={48} color="#667eea" />
          <Text style={styles.loadingTitle}>Finding tutors...</Text>
          <Text style={styles.loadingSubtitle}>Please wait while we load available tutors</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (tutorsError) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to load tutors</Text>
          <Text style={styles.errorSubtitle}>{tutorsError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Student View - Clean Tutor Discovery
  if (isStudent) {
    if (!currentTutor || filteredTutors.length === 0) {
      return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Discover Tutors</Text>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <RefreshCw size={20} color="#667eea" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.emptyContainer}>
            <Sparkles size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {tutors.length === 0 ? 'No tutors available' : 'No tutors match your criteria'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {tutors.length === 0 
                ? 'Check back later for new tutors'
                : 'Try adjusting your filters'
              }
            </Text>
            {filteredTutors.length === 0 && tutors.length > 0 && (
              <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Clean Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Discover Tutors</Text>
            <Text style={styles.headerSubtitle}>
              {filteredTutors.length} available • {matches.length} matches
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.filterButton} onPress={handleResetFilters}>
              <Filter size={18} color="#667eea" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
              <RefreshCw size={18} color="#667eea" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Container */}
        <View style={styles.cardContainer}>
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={[styles.card, cardStyle]}>
              <Image 
                source={{ 
                  uri: currentTutor.avatar_url || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop'
                }} 
                style={styles.cardImage} 
              />
              
              {/* Simple badges */}
              {currentTutor.verified && (
                <View style={styles.verifiedBadge}>
                  <Star size={12} color="#fff" fill="#fff" />
                  <Text style={styles.badgeText}>Verified</Text>
                </View>
              )}

              <View style={styles.onlineStatus}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
              
              <LinearGradient 
                colors={['transparent', 'rgba(0,0,0,0.8)']} 
                style={styles.cardOverlay}
              />
              
              <View style={styles.cardContent}>
                <Text style={styles.name}>
                  {currentTutor.first_name} {currentTutor.last_name}
                </Text>
                
                <View style={styles.ratingRow}>
                  <View style={styles.rating}>
                    <Star size={14} color="#fbbf24" fill="#fbbf24" />
                    <Text style={styles.ratingText}>{currentTutor.rating || '4.8'}</Text>
                  </View>
                  <Text style={styles.rate}>${currentTutor.hourly_rate || '35'}/hr</Text>
                </View>

                <Text style={styles.university}>
                  {currentTutor.major} at {currentTutor.university}
                </Text>

                <View style={styles.subjects}>
                  {currentTutor.tutor_subjects?.slice(0, 3).map((tutorSubject: any, index: number) => (
                    <View key={index} style={styles.subjectTag}>
                      <Text style={styles.subjectText}>{tutorSubject.subjects?.name}</Text>
                    </View>
                  ))}
                  {(currentTutor.tutor_subjects?.length || 0) > 3 && (
                    <View style={styles.subjectTag}>
                      <Text style={styles.subjectText}>+{(currentTutor.tutor_subjects?.length || 0) - 3}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.bio} numberOfLines={2}>
                  {currentTutor.bio || 'Experienced tutor ready to help you succeed in your studies.'}
                </Text>

                <View style={styles.details}>
                  <View style={styles.detailItem}>
                    <MapPin size={12} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.detailText}>Nearby</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Clock size={12} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.detailText}>Available</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </PanGestureHandler>
        </View>

        {/* Simple Action Buttons */}
        <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom + 20, 30) }]}>
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
            <X size={24} color="#ef4444" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
            <Heart size={24} color="#fff" fill="#fff" />
          </TouchableOpacity>
        </View>

        {/* Match Modal */}
        {showMatchModal && (
          <View style={styles.matchModal}>
            <View style={styles.matchModalContent}>
              <Sparkles size={32} color="#667eea" />
              <Text style={styles.matchTitle}>It's a Match! 🎉</Text>
              <Text style={styles.matchSubtitle}>You and {currentTutor.first_name} can now chat</Text>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Tutor View - Simple Student Requests
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Student Requests</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <RefreshCw size={18} color="#667eea" />
        </TouchableOpacity>
      </View>

      <View style={styles.emptyContainer}>
        <Users size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No new requests</Text>
        <Text style={styles.emptySubtitle}>
          Students will appear here when they're interested in your services
        </Text>
      </View>
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
    paddingHorizontal: 40,
  },
  loadingTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '65%',
    backgroundColor: '#f0f0f0',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  onlineStatus: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  onlineText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  rate: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  university: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  subjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  subjectTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  subjectText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  bio: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.8)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rejectButton: {
    width: 56,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  likeButton: {
    width: 64,
    height: 64,
    backgroundColor: '#667eea',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  resetButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  matchModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  matchModalContent: {
    backgroundColor: '#fff',
    margin: 32,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  matchTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  matchSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
    textAlign: 'center',
  },
});