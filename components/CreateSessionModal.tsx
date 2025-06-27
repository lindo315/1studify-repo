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
import { X, Calendar, Clock, Video, MapPin, User, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 375;

interface CreateSessionModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateSession: (sessionData: any) => void;
  userRole: 'student' | 'tutor';
}

export default function CreateSessionModal({
  visible,
  onClose,
  onCreateSession,
  userRole,
}: CreateSessionModalProps) {
  const [studyPlanId, setStudyPlanId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('60');
  const [type, setType] = useState<'video' | 'in_person'>('video');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!scheduledAt.trim() || !duration.trim()) {
      Alert.alert('Error', 'Please fill in the date/time and duration fields.');
      return;
    }

    const sessionData = {
      study_plan_id: studyPlanId || null,
      scheduled_at: scheduledAt.trim(),
      duration_minutes: parseInt(duration, 10),
      type,
      location: type === 'in_person' ? location.trim() : null,
      notes: notes.trim() || null,
      status: 'scheduled',
    };

    onCreateSession(sessionData);
    resetForm();
  };

  const resetForm = () => {
    setStudyPlanId('');
    setScheduledAt('');
    setDuration('60');
    setType('video');
    setLocation('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const SessionTypeButton = ({ 
    sessionType, 
    selected, 
    onPress, 
    icon: Icon, 
    label 
  }: { 
    sessionType: 'video' | 'in_person'; 
    selected: boolean; 
    onPress: () => void;
    icon: any;
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        selected && styles.typeButtonSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Icon 
        size={20} 
        color={selected ? '#fff' : '#667eea'} 
      />
      <Text
        style={[
          styles.typeButtonText,
          selected && styles.typeButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const DurationButton = ({ minutes, selected, onPress }: { 
    minutes: string; 
    selected: boolean; 
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[
        styles.durationButton,
        selected && styles.durationButtonSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.durationButtonText,
          selected && styles.durationButtonTextSelected,
        ]}
      >
        {minutes} min
      </Text>
    </TouchableOpacity>
  );

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
            <Calendar size={24} color="#667eea" />
            <Text style={styles.headerTitle}>Schedule Session</Text>
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
            <Text style={styles.sectionTitle}>Session Type</Text>
            <View style={styles.typeContainer}>
              <SessionTypeButton
                sessionType="video"
                selected={type === 'video'}
                onPress={() => setType('video')}
                icon={Video}
                label="Video Call"
              />
              <SessionTypeButton
                sessionType="in_person"
                selected={type === 'in_person'}
                onPress={() => setType('in_person')}
                icon={MapPin}
                label="In Person"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date & Time</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Scheduled Date & Time *</Text>
              <Text style={styles.helperText}>Format: YYYY-MM-DD HH:MM</Text>
              <TextInput
                style={styles.input}
                value={scheduledAt}
                onChangeText={setScheduledAt}
                placeholder="2024-01-15 14:30"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration</Text>
            <View style={styles.durationContainer}>
              <DurationButton
                minutes="30"
                selected={duration === '30'}
                onPress={() => setDuration('30')}
              />
              <DurationButton
                minutes="60"
                selected={duration === '60'}
                onPress={() => setDuration('60')}
              />
              <DurationButton
                minutes="90"
                selected={duration === '90'}
                onPress={() => setDuration('90')}
              />
              <DurationButton
                minutes="120"
                selected={duration === '120'}
                onPress={() => setDuration('120')}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Custom Duration (minutes)</Text>
              <TextInput
                style={styles.input}
                value={duration}
                onChangeText={setDuration}
                placeholder="Enter duration in minutes"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>

          {type === 'in_person' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Meeting Location</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Enter meeting location"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Study Plan (Optional)</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Study Plan ID</Text>
              <Text style={styles.helperText}>Link this session to a specific study plan</Text>
              <TextInput
                style={styles.input}
                value={studyPlanId}
                onChangeText={setStudyPlanId}
                placeholder="Enter study plan ID"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Session Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any special instructions or notes for this session..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
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
              <Calendar size={16} color="#fff" />
              <Text style={styles.createButtonText}>Schedule Session</Text>
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
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667eea',
    backgroundColor: '#fff',
    gap: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#667eea',
  },
  typeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#667eea',
  },
  typeButtonTextSelected: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
  },
  durationContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  durationButtonSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  durationButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  durationButtonTextSelected: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
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