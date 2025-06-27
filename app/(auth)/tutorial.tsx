import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useState, useRef } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Calendar, GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const tutorialSteps = [
  {
    id: 1,
    icon: Heart,
    title: 'Swipe to Connect',
    description: 'Browse through tutor profiles and swipe right on those who match your learning style and subject needs.',
    gradient: ['#FF6B9D', '#C44569'],
  },
  {
    id: 2,
    icon: MessageCircle,
    title: 'Chat & Schedule',
    description: 'Once matched, chat with your tutor to discuss your goals and schedule your first session.',
    gradient: ['#4ECDC4', '#44A08D'],
  },
  {
    id: 3,
    icon: Calendar,
    title: 'Learn Together',
    description: 'Attend personalized sessions, track your progress, and achieve your academic goals.',
    gradient: ['#45B7D1', '#96C93D'],
  },
  {
    id: 4,
    icon: GraduationCap,
    title: 'Level Up',
    description: 'Build your reputation, earn badges, and become part of a thriving learning community.',
    gradient: ['#96C93D', '#4ECDC4'],
  },
];

export default function TutorialScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const translateX = useSharedValue(0);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      translateX.value = withSpring(-(currentStep + 1) * width);
    } else {
      router.push('/(auth)/role-selection');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      translateX.value = withSpring(-(currentStep - 1) * width);
    }
  };

  const skipTutorial = () => {
    router.push('/(auth)/role-selection');
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const step = tutorialSteps[currentStep];
  const IconComponent = step.icon;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={step.gradient}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={skipTutorial}
          >
            <Text style={styles.skipText}>Skip Tutorial</Text>
          </TouchableOpacity>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>Step {currentStep + 1} of {tutorialSteps.length}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Animated.View style={[styles.slidesContainer, animatedStyle]}>
            {tutorialSteps.map((tutorialStep, index) => {
              const StepIcon = tutorialStep.icon;
              return (
                <View key={tutorialStep.id} style={styles.slide}>
                  <View style={styles.iconContainer}>
                    <View style={styles.iconBackground}>
                      <StepIcon size={80} color="#fff" />
                    </View>
                  </View>
                  
                  <Text style={styles.title}>{tutorialStep.title}</Text>
                  <Text style={styles.description}>{tutorialStep.description}</Text>
                </View>
              );
            })}
          </Animated.View>
        </View>

        {/* Progress Dots */}
        <View style={styles.progressContainer}>
          {tutorialSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, currentStep === 0 && styles.navButtonHidden]}
            onPress={prevStep}
          >
            <ArrowLeft size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
            <LinearGradient
              colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.8)']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <ArrowRight size={20} color={step.gradient[0]} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.9)',
  },
  stepIndicator: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  stepText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
  },
  slidesContainer: {
    flexDirection: 'row',
    width: width * tutorialSteps.length,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    marginBottom: 20,
  },
  description: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 26,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressDotActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 50,
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
    color: 'rgba(255,255,255,0.9)',
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
    color: '#333',
  },
});