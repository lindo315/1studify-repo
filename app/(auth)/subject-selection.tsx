import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Plus, Check, ArrowRight, BookOpen, Calculator, Atom, Code, Globe, Palette } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Subject {
  id: string;
  name: string;
  category: string;
}

const categoryIcons = {
  'STEM': Calculator,
  'Science': Atom,
  'Technology': Code,
  'Humanities': Globe,
  'Arts': Palette,
  'Business': BookOpen,
};

export default function SubjectSelectionScreen() {
  const { profile, updateProfile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      Alert.alert('Error', 'Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleContinue = async () => {
    if (selectedSubjects.length === 0) {
      Alert.alert('Select Subjects', 'Please select at least one subject you\'re interested in.');
      return;
    }

    setSaving(true);

    try {
      if (profile?.role === 'tutor') {
        // For tutors, save to tutor_subjects table
        const tutorSubjects = selectedSubjects.map(subjectId => ({
          tutor_id: profile.id,
          subject_id: subjectId,
          proficiency_level: 'intermediate' as const, // Default level
        }));

        const { error } = await supabase
          .from('tutor_subjects')
          .insert(tutorSubjects);

        if (error) throw error;
      }
      // For students, we'll handle this differently in the future
      // For now, just continue to the main app

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving subjects:', error);
      Alert.alert('Error', 'Failed to save your subject preferences');
    } finally {
      setSaving(false);
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedSubjects = filteredSubjects.reduce((acc, subject) => {
    if (!acc[subject.category]) {
      acc[subject.category] = [];
    }
    acc[subject.category].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading subjects...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {profile?.role === 'tutor' ? 'What do you teach?' : 'What do you want to learn?'}
        </Text>
        <Text style={styles.subtitle}>
          {profile?.role === 'tutor' 
            ? 'Select the subjects you can help students with'
            : 'Choose subjects you need help with or want to improve'
          }
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedSubjects).map(([category, categorySubjects]) => {
          const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || BookOpen;
          
          return (
            <View key={category} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryIconContainer}>
                  <IconComponent size={20} color="#fff" />
                </View>
                <Text style={styles.categoryTitle}>{category}</Text>
              </View>
              
              <View style={styles.subjectsGrid}>
                {categorySubjects.map(subject => (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.subjectCard,
                      selectedSubjects.includes(subject.id) && styles.subjectCardSelected
                    ]}
                    onPress={() => toggleSubject(subject.id)}
                  >
                    <Text style={[
                      styles.subjectName,
                      selectedSubjects.includes(subject.id) && styles.subjectNameSelected
                    ]}>
                      {subject.name}
                    </Text>
                    {selectedSubjects.includes(subject.id) && (
                      <View style={styles.checkIcon}>
                        <Check size={16} color="#667eea" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        <View style={styles.customSubjectSection}>
          <TouchableOpacity style={styles.addCustomButton}>
            <Plus size={20} color="#fff" />
            <Text style={styles.addCustomText}>Request a custom subject</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.selectionSummary}>
          <Text style={styles.selectionText}>
            {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (selectedSubjects.length === 0 || saving) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={selectedSubjects.length === 0 || saving}
        >
          <LinearGradient
            colors={
              selectedSubjects.length === 0 || saving
                ? ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']
                : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.9)']
            }
            style={styles.continueButtonGradient}
          >
            <Text style={[
              styles.continueButtonText,
              (selectedSubjects.length === 0 || saving) && styles.continueButtonTextDisabled
            ]}>
              {saving ? 'Setting up...' : 'Continue to App'}
            </Text>
            {!saving && selectedSubjects.length > 0 && (
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subjectCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 120,
    position: 'relative',
  },
  subjectCardSelected: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(255,255,255,0.8)',
  },
  subjectName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
    flex: 1,
  },
  subjectNameSelected: {
    color: '#333',
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  customSubjectSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  addCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  addCustomText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
    gap: 16,
  },
  selectionSummary: {
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  continueButton: {
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
  continueButtonDisabled: {
    shadowOpacity: 0.1,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 8,
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