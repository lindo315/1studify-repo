import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
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
import { X, Heart, Star, MapPin, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTutors, useMatches } from '@/hooks/useSupabaseData';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = height * 0.75;

export default function DiscoverScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'forYou' | 'nearby'>('forYou');
  
  const { tutors, loading: tutorsLoading } = useTutors();
  const { createMatch } = useMatches();
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  
  const currentTutor = tutors[currentIndex];
  const nextTutor = tutors[currentIndex + 1];

  const onSwipe = async (direction: 'left' | 'right') => {
    if (direction === 'right' && currentTutor) {
      try {
        await createMatch(currentTutor.id);
      } catch (error) {
        console.error('Error creating match:', error);
      }
    }
    
    if (currentIndex < tutors.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
    
    // Reset card position
    translateX.value = 0;
    translateY.value = 0;
  };

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: (event) => {
      const shouldSwipe = Math.abs(event.translationX) > width * 0.3;
      
      if (shouldSwipe) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        translateX.value = withTiming(event.translationX > 0 ? width : -width, { duration: 200 });
        
        runOnJS(onSwipe)(direction);
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-width / 2, 0, width / 2],
      [-15, 0, 15],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const handlePass = () => {
    translateX.value = withTiming(-width, { duration: 200 });
    setTimeout(() => onSwipe('left'), 200);
  };

  const handleLike = () => {
    translateX.value = withTiming(width, { duration: 200 });
    setTimeout(() => onSwipe('right'), 200);
  };

  if (!currentTutor || tutors.length === 0) {
    return (
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tutors available</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#8B5CF6', '#7C3AED']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setActiveTab('forYou')}>
            <Text style={[styles.tabText, activeTab === 'forYou' && styles.tabTextActive]}>
              For You
            </Text>
          </TouchableOpacity>
          <Text style={styles.tabDivider}>|</Text>
          <TouchableOpacity onPress={() => setActiveTab('nearby')}>
            <Text style={[styles.tabText, activeTab === 'nearby' && styles.tabTextActive]}>
              Nearby
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.profileButton}>
          <User size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Cards Container */}
      <View style={styles.cardsContainer}>
        {/* Next Card (underneath) */}
        {nextTutor && (
          <View style={[styles.card, styles.nextCard]}>
            <Image 
              source={{ uri: nextTutor.avatar_url || 'https://via.placeholder.com/400x600' }} 
              style={styles.cardImage} 
            />
          </View>
        )}

        {/* Current Card */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.card, cardStyle]}>
            {/* Distance Badge */}
            <View style={styles.distanceBadge}>
              <MapPin size={12} color="#6B7280" />
              <Text style={styles.distanceText}>2km away</Text>
            </View>

            {/* Online Status */}
            <View style={styles.onlineStatus}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>

            {/* Profile Image */}
            <Image 
              source={{ 
                uri: currentTutor.avatar_url || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600&h=900&fit=crop'
              }} 
              style={styles.cardImage} 
            />

            {/* Card Content */}
            <View style={styles.cardContent}>
              <Text style={styles.name}>
                {currentTutor.first_name} {currentTutor.last_name}, 22
              </Text>
              
              <Text style={styles.university}>
                {currentTutor.major || 'Computer Science'} at {currentTutor.university || 'UC Berkeley'}
              </Text>

              <View style={styles.ratingRow}>
                <View style={styles.rating}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>{currentTutor.rating || '4.8'} (15 reviews)</Text>
                </View>
              </View>

              <Text style={styles.price}>${currentTutor.hourly_rate || 35}/hour</Text>

              <View style={styles.subjects}>
                {currentTutor.tutor_subjects?.slice(0, 3).map((tutorSubject: any, index: number) => (
                  <View key={index} style={styles.subjectTag}>
                    <Text style={styles.subjectText}>{tutorSubject.subjects?.name || 'Math'}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </View>

      {/* Action Buttons */}
      <View style={[styles.actions, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <TouchableOpacity style={styles.passButton} onPress={handlePass}>
          <X size={28} color="#6B7280" strokeWidth={3} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Heart size={32} color="#fff" fill="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabDivider: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 16,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    position: 'absolute',
  },
  nextCard: {
    opacity: 0.4,
    transform: [{ scale: 0.95 }],
  },
  distanceBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 1,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  onlineStatus: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 1,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
  cardImage: {
    width: '100%',
    height: '65%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  cardContent: {
    flex: 1,
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  university: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  subjects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
    paddingTop: 20,
  },
  passButton: {
    width: 56,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  likeButton: {
    width: 64,
    height: 64,
    backgroundColor: '#7C3AED',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});