import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BookOpen, Users, Star, Sparkles, Target, TrendingUp } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const handleGetStarted = () => {
    router.push('/(auth)/tutorial');
  };

  const handleSignIn = () => {
    router.push('/(auth)/login');
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.logoBackground}
            >
              <BookOpen size={60} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Studify</Text>
          <Text style={styles.subtitle}>Your personal learning companion</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Users size={24} color="#fff" />
              </View>
              <Text style={styles.featureText}>Connect with Expert Tutors</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Target size={24} color="#fff" />
              </View>
              <Text style={styles.featureText}>Personalized Study Plans</Text>
            </View>
          </View>
          
          <View style={styles.featureRow}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <TrendingUp size={24} color="#fff" />
              </View>
              <Text style={styles.featureText}>Track Your Progress</Text>
            </View>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Star size={24} color="#fff" />
              </View>
              <Text style={styles.featureText}>Achieve Your Goals</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleGetStarted}
          >
            <LinearGradient
              colors={['#fff', '#f8f9fa']}
              style={styles.primaryButtonGradient}
            >
              <Sparkles size={20} color="#667eea" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Get Started Free</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleSignIn}
          >
            <Text style={styles.secondaryButtonText}>Already have an account?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.trustIndicators}>
          <Text style={styles.trustText}>Trusted by 10,000+ students</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} color="#fbbf24" fill="#fbbf24" />
              ))}
            </View>
            <Text style={styles.ratingText}>4.9/5 rating</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
    paddingBottom: 50,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  features: {
    alignItems: 'center',
    gap: 24,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 24,
    width: '100%',
    justifyContent: 'center',
  },
  feature: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 140,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttons: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
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
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.9)',
  },
  trustIndicators: {
    alignItems: 'center',
    gap: 8,
  },
  trustText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255,255,255,0.9)',
  },
});