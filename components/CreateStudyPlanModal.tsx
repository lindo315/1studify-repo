import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { X, BookOpen, Target, Calendar, Clock, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

interface CreateStudyPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onCreatePlan: (planData: any) => void;
  userRole: 'student' | 'tutor';
}

export default function CreateStudyPlanModal({
  visible,
  onClose,
  onCreatePlan,
  userRole,
}: CreateStudyPlanModalProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [goals, setGoals] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !subject.trim()) {
      Alert.alert('Error', 'Please fill in the title and subject fields.');
      return;
    }

    const goalsArray = goals
      .split('\n')
      .map(goal => goal.trim())
      .filter(goal => goal.length > 0);

    const planData = {
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim() || null,
      goals: goalsArray,
      difficulty_level: difficultyLevel,
      estimated_hours: estimatedHours ? parseInt(estimatedHours, 10) : 0,
      due_date: dueDate || null,
      status: 'active',
      progress: 0,
    };

    onCreatePlan(planData);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setDescription('');
    setGoals('');
    setDifficultyLevel('intermediate');
    setEstimatedHours('');
    setDueDate('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const DifficultyButton = ({ level, selected, onPress }: { 
    level: 'beginner' | 'intermediate' | 'advanced'; 
    selected: boolean; 
    onPress: () => void;
  }) => {
    const colors = {
      beginner: '#10b981',
      intermediate: '#06b6d4',
      advanced: '#8b5cf6',
    };

    return (
      <TouchableOpacity
        style={[
          styles.difficultyButton,
          selected && { backgroundColor: colors[level] },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.difficultyButtonText,
            selected && styles.difficultyButtonTextSelected,
          ]}
        >
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <BookOpen size={24} color="#667eea" />
            <Text style={styles.headerTitle}>Create Study Plan</Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter study plan title"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject *</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="e.g., Mathematics, Physics, English"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what this study plan covers..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Goals</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Learning Goals</Text>
              <Text style={styles.helperText}>Enter each goal on a new line</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={goals}
                onChangeText={setGoals}
                placeholder="Goal 1&#10;Goal 2&#10;Goal 3"
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Difficulty Level</Text>
            <View style={styles.difficultyContainer}>
              <DifficultyButton
                level="beginner"
                selected={difficultyLevel === 'beginner'}
                onPress={() => setDifficultyLevel('beginner')}
              />
              <DifficultyButton
                level="intermediate"
                selected={difficultyLevel === 'intermediate'}
                onPress={() => setDifficultyLevel('intermediate')}
              />
              <DifficultyButton
                level="advanced"
                selected={difficultyLevel === 'advanced'}
                onPress={() => setDifficultyLevel('advanced')}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Planning Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estimated Hours</Text>
              <TextInput
                style={styles.input}
                value={estimatedHours}
                onChangeText={setEstimatedHours}
                placeholder="Total hours needed"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Due Date (Optional)</Text>
              <TextInput
                style={styles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.createButtonGradient}
            >
              <Target size={16} color="#fff" />
              <Text style={styles.createButtonText}>Create Plan</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#333',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#333',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  difficultyButtonTextSelected: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  createButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});