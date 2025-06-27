import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { BookOpen, GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

export default function RoleSelectionScreen() {
  const [selectedRole, setSelectedRole] = useState<'student' | 'tutor' | null>(null);
  const [loading, setLoading] = useState(false);
  
  const studentScale = useSharedValue(1);
  const tutorScale = useSharedValue(1);

  const handleRoleSelect = (role: 'student' | 'tutor') => {
    setSelectedRole(role);
    
    if (role === 'student') {
      studentScale.value = withSpring(1.05);
      tutorScale.value = withSpring(0.95);
    } else {
      tutorScale.value = withSpring(1.05);
      studentScale.value = withSpring(0.95);
    }
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    setLoading(true);
    
    // Store role in context or pass to next screen
    router.push({
      pathname: '/(auth)/basic-info',
      params: { role: selectedRole }
    });
  };

  const goBack = () => {
    router.back();
  };

  const studentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: studentScale.value }],
    };
  });

  const tutorAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: tutorScale.value }],
    };
  });

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepText}>Step 1 of 5</Text>
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>Are you looking to learn or teach?</Text>
      </View>

      {/* Role Options */}
      <View style={styles.optionsContainer}>
        <Animated.View style={[studentAnimatedStyle]}>
          <TouchableOpacity 
            style={[
              styles.roleOption,
              selectedRole === 'student' && styles.roleOptionSelected
            ]}
            onPress={() => handleRoleSelect('student')}
          >
            <LinearGradient
              colors={selectedRole === 'student' 
                ? ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']
                : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.1)']
              }
              style={styles.roleOptionGradient}
            >
              <View style={[
                styles.roleIcon,
                { backgroundColor: selectedRole === 'student' ? '#667eea' : 'rgba(255,255,255,0.3)' }
              ]}>
                <BookOpen 
                  size={40} 
                  color={selectedRole === 'student' ? '#fff' : '#fff'} 
                />
              </View>
              
              <Text style={[
                styles.roleTitle,
                selectedRole === 'student' && styles.roleTitleSelected
              ]}>
                I'm a Student
              </Text>
              
              <Text style={[
                styles.roleDescription,
                selectedRole === 'student' && styles.roleDescriptionSelected
              ]}>
                Looking for help with my studies
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[tutorAnimatedStyle]}>
          <TouchableOpacity 
            style={[
              styles.roleOption,
              selectedRole === 'tutor' && styles.roleOptionSelected
            ]}
            onPress={() => handleRoleSelect('tutor')}
          >
            <LinearGradient
              colors={selectedRole === 'tutor' 
                ? ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']
                : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.1)']
              }
              style={styles.roleOptionGradient}
            >
              <View style={[
                styles.roleIcon,
                { backgroundColor: selectedRole === 'tutor' ? '#667eea' : 'rgba(255,255,255,0.3)' }
              ]}>
                <GraduationCap 
                  size={40} 
                  color={selectedRole === 'tutor' ? '#fff' : '#fff'} 
                />
              </View>
              
              <Text style={[
                styles.roleTitle,
                selectedRole === 'tutor' && styles.roleTitleSelected
              ]}>
                I'm a Tutor
              </Text>
              
              <Text style={[
                styles.roleDescription,
                selectedRole === 'tutor' && styles.roleDescriptionSelected
              ]}>
                Ready to help others learn
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={20} color="rgba(255,255,255,0.8)" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.continueButton,
            (!selectedRole || loading) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedRole || loading}
        >
          <LinearGradient
            colors={(!selectedRole || loading) 
              ? ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']
              : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']
            }
            style={styles.continueButtonGradient}
          >
            <Text style={[
              styles.continueButtonText,
              (!selectedRole || loading) && styles.continueButtonTextDisabled
            ]}>
              {loading ? 'Loading...' : 'Continue'}
            </Text>
            {!loading && selectedRole && (
              <ArrowRight size={20} color="#667eea" />
            )}
          </LinearGradient>
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
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
    marginBottom: 60,
  },
  stepText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
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
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  roleOption: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  roleOptionSelected: {
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  roleOptionGradient: {
    padding: 32,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  roleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  roleTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleTitleSelected: {
    color: '#333',
  },
  roleDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  roleDescriptionSelected: {
    color: '#666',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  backButton: {
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
  backButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.9)',
  },
  continueButton: {
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
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
  },
  continueButtonTextDisabled: {
    color: 'rgba(255,255,255,0.6)',
  },
});