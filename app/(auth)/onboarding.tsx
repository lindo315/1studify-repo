import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Users, Target, TrendingUp, Star, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const onboardingSteps = [
  {
    id: 1,
    icon: BookOpen,
    title: 'Welcome to Studify',
    subtitle: 'Your personalized learning companion',
    description: 'Connect with expert tutors, create study plans, and track your academic progress all in one place.',
    color: '#667eea',
  },
  {
    id: 2,
    icon: Users,
    title: 'Find Perfect Matches',
    subtitle: 'Connect with the right tutors',
    description: 'Our smart matching system connects you with tutors who specialize in your subjects and learning style.',
    color: '#764ba2',
  },
  {
    id: 3,
    icon: Target,
    title: 'Set Your Goals',
    subtitle: 'Create personalized study plans',
    description: 'Work with your tutor to create custom study plans that fit your schedule and learning objectives.',
    color: '#10b981',
  },
  {
    id: 4,
    icon: TrendingUp,
    title: 'Track Progress',
    subtitle: 'Monitor your improvement',
    description: 'See your progress in real-time with detailed analytics and celebrate your achievements.',
    color: '#f59e0b',
  },
];

export default function OnboardingScreen() {
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      scrollViewRef.current?.scrollTo({ x: newStep * width, animated: true });
    } else {
      router.push('/(auth)/subject-selection');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      scrollViewRef.current?.scrollTo({ x: newStep * width, animated: true });
    }
  };

  const skipToEnd = () => {
    router.push('/(auth)/subject-selection');
  };

  const step = onboardingSteps[currentStep];
  const IconComponent = step.icon;

  return (
    <LinearGradient
      colors={[step.color, '#764ba2']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.skipButton, currentStep === 0 && styles.skipButtonHidden]}
          onPress={skipToEnd}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {onboardingSteps.map((stepData, index) => {
          const StepIcon = stepData.icon;
          return (
            <View key={stepData.id} style={styles.stepContainer}>
              <View style={styles.content}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.iconBackground}
                  >
                    <StepIcon size={80} color="#fff" />
                  </LinearGradient>
                </View>

                <Text style={styles.title}>{stepData.title}</Text>
                <Text style={styles.subtitle}>{stepData.subtitle}</Text>
                <Text style={styles.description}>{stepData.description}</Text>

                {stepData.id === 2 && (
                  <View style={styles.featureList}>
                    <View style={styles.feature}>
                      <Star size={16} color="#fbbf24" fill="#fbbf24" />
                      <Text style={styles.featureText}>Verified expert tutors</Text>
                    </View>
                    <View style={styles.feature}>
                      <Target size={16} color="#10b981" />
                      <Text style={styles.featureText}>Subject-specific matching</Text>
                    </View>
                    <View style={styles.feature}>
                      <TrendingUp size={16} color="#f59e0b" />
                      <Text style={styles.featureText}>Real-time availability</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentStep && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>

        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, currentStep === 0 && styles.navButtonHidden]}
            onPress={prevStep}
          >
            <ArrowLeft size={20} color="#fff" />
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <ArrowRight size={20} color={step.color} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  skipButtonHidden: {
    opacity: 0,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featureList: {
    marginTop: 32,
    gap: 16,
    alignItems: 'flex-start',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    gap: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  navButtonHidden: {
    opacity: 0,
  },
  navButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  nextButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
  },
});