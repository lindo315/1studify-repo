import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { Award, X, Star, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Achievement } from '@/types/enhancements';

interface AchievementModalProps {
  visible: boolean;
  onClose: () => void;
  achievement: Achievement | null;
}

const { width } = Dimensions.get('window');

export default function AchievementModal({ visible, onClose, achievement }: AchievementModalProps) {
  if (!achievement) return null;

  const getAchievementIcon = (category: string) => {
    switch (category) {
      case 'study': return Star;
      case 'social': return Award;
      case 'progress': return Zap;
      default: return Award;
    }
  };

  const IconComponent = getAchievementIcon(achievement.category);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient colors={['#667eea', '#764ba2']} style={styles.content}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.achievementContent}>
              <View style={styles.iconContainer}>
                <LinearGradient colors={['#fbbf24', '#f59e0b']} style={styles.iconBackground}>
                  <IconComponent size={48} color="#fff" />
                </LinearGradient>
              </View>

              <Text style={styles.congratsText}>Congratulations!</Text>
              <Text style={styles.achievementTitle}>{achievement.name}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>

              <View style={styles.pointsContainer}>
                <Star size={20} color="#fbbf24" fill="#fbbf24" />
                <Text style={styles.pointsText}>+{achievement.points} XP</Text>
              </View>

              <TouchableOpacity style={styles.continueButton} onPress={onClose}>
                <LinearGradient colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']} style={styles.continueButtonGradient}>
                  <Text style={styles.continueButtonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  content: {
    padding: 32,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fbbf24',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  congratsText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 32,
    gap: 8,
  },
  pointsText: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  continueButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});