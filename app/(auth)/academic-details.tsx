import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ArrowRight, Building, BookOpen, ChevronDown } from 'lucide-react-native';

const universities = [
  'Harvard University',
  'Stanford University',
  'MIT',
  'UC Berkeley',
  'UCLA',
  'Yale University',
  'Princeton University',
  'Columbia University',
  'University of Chicago',
  'Other'
];

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Psychology',
];

export default function AcademicDetailsScreen() {
  const { role, fullName, age } = useLocalSearchParams<{ 
    role: 'student' | 'tutor';
    fullName: string;
    age: string;
  }>();
  
  const [formData, setFormData] = useState({
    university: '',
    major: '',
    selectedSubjects: [] as string[],
  });
  const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter(s => s !== subject)
        : [...prev.selectedSubjects, subject]
    }));
  };

  const handleContinue = () => {
    if (!formData.university.trim()) {
      Alert.alert('Required Field', 'Please select your university');
      return;
    }

    if (!formData.major.trim()) {
      Alert.alert('Required Field', 'Please enter your major');
      return;
    }

    if (formData.selectedSubjects.length === 0) {
      Alert.alert('Required Field', `Please select at least one subject you ${role === 'student' ? 'need help with' : 'can teach'}`);
      return;
    }

    setLoading(true);
    
    router.push({
      pathname: '/(auth)/create-account',
      params: { 
        role,
        fullName,
        age,
        university: formData.university,
        major: formData.major,
        subjects: JSON.stringify(formData.selectedSubjects)
      }
    });
  };

  const goBack = () => {
    router.back();
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.stepText}>Step 3 of 5</Text>
            <Text style={styles.title}>Academic Details</Text>
            <Text style={styles.subtitle}>Share your academic background</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* University */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>University*</Text>
              <TouchableOpacity 
                style={styles.dropdownContainer}
                onPress={() => setShowUniversityDropdown(!showUniversityDropdown)}
              >
                <Building size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                <Text style={[
                  styles.dropdownText,
                  !formData.university && styles.dropdownPlaceholder
                ]}>
                  {formData.university || 'Select your university'}
                </Text>
                <ChevronDown size={20} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
              
              {showUniversityDropdown && (
                <View style={styles.dropdown}>
                  {universities.map((uni, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, university: uni }));
                        setShowUniversityDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{uni}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Major */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Major*</Text>
              <View style={styles.inputContainer}>
                <BookOpen size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Computer Science, Biology..."
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={formData.major}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, major: text }))}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Subjects */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Subjects You {role === 'student' ? 'Need Help With' : 'Can Teach'}*
              </Text>
              <Text style={styles.sublabel}>Select at least one subject</Text>
              
              <View style={styles.subjectsGrid}>
                {subjects.map((subject, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.subjectChip,
                      formData.selectedSubjects.includes(subject) && styles.subjectChipSelected
                    ]}
                    onPress={() => handleSubjectToggle(subject)}
                  >
                    <Text style={[
                      styles.subjectChipText,
                      formData.selectedSubjects.includes(subject) && styles.subjectChipTextSelected
                    ]}>
                      {subject}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.backButton} onPress={goBack}>
            <ArrowLeft size={20} color="rgba(255,255,255,0.8)" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.continueButton,
              loading && styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={loading}
          >
            <LinearGradient
              colors={loading 
                ? ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']
                : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']
              }
              style={styles.continueButtonGradient}
            >
              <Text style={[
                styles.continueButtonText,
                loading && styles.continueButtonTextDisabled
              ]}>
                {loading ? 'Loading...' : 'Continue'}
              </Text>
              {!loading && (
                <ArrowRight size={20} color="#667eea" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
    marginBottom: 40,
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
  form: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
    paddingVertical: 16,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
  },
  dropdownPlaceholder: {
    color: 'rgba(255,255,255,0.5)',
  },
  dropdown: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subjectChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  subjectChipSelected: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(255,255,255,0.8)',
  },
  subjectChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  subjectChipTextSelected: {
    color: '#333',
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