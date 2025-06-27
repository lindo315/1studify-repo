import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { X, Filter, MapPin, DollarSign, Star, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TutorFilters } from '@/types/enhancements';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: TutorFilters;
  onApplyFilters: (filters: TutorFilters) => void;
}

export default function FilterModal({ visible, onClose, filters, onApplyFilters }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<TutorFilters>(filters);

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'History', 'Psychology', 'Economics', 'Business'
  ];

  const priceRanges = [
    { label: '$20-40/hr', range: [20, 40] as [number, number] },
    { label: '$40-60/hr', range: [40, 60] as [number, number] },
    { label: '$60-80/hr', range: [60, 80] as [number, number] },
    { label: '$80+/hr', range: [80, 200] as [number, number] },
  ];

  const distances = [
    { label: '5 miles', value: 5 },
    { label: '10 miles', value: 10 },
    { label: '25 miles', value: 25 },
    { label: '50 miles', value: 50 },
  ];

  const ratings = [
    { label: '4.5+ stars', value: 4.5 },
    { label: '4.0+ stars', value: 4.0 },
    { label: '3.5+ stars', value: 3.5 },
    { label: 'Any rating', value: 0 },
  ];

  const handleSubjectToggle = (subject: string) => {
    setLocalFilters(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: TutorFilters = {
      subjects: [],
      maxDistance: 25,
      priceRange: [20, 200],
      availability: [],
      minRating: 0,
      teachingStyle: [],
      verified: false
    };
    setLocalFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  // Update local filters when props change
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Filter Tutors</Text>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Subjects */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Filter size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>Subjects</Text>
            </View>
            <View style={styles.subjectsGrid}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.subjectChip,
                    localFilters.subjects.includes(subject) && styles.subjectChipSelected
                  ]}
                  onPress={() => handleSubjectToggle(subject)}
                >
                  <Text style={[
                    styles.subjectChipText,
                    localFilters.subjects.includes(subject) && styles.subjectChipTextSelected
                  ]}>
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <DollarSign size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>Price Range</Text>
            </View>
            <View style={styles.optionsGrid}>
              {priceRanges.map((range, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionChip,
                    localFilters.priceRange[0] === range.range[0] && 
                    localFilters.priceRange[1] === range.range[1] && styles.optionChipSelected
                  ]}
                  onPress={() => setLocalFilters(prev => ({ ...prev, priceRange: range.range }))}
                >
                  <Text style={[
                    styles.optionChipText,
                    localFilters.priceRange[0] === range.range[0] && 
                    localFilters.priceRange[1] === range.range[1] && styles.optionChipTextSelected
                  ]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distance */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>Maximum Distance</Text>
            </View>
            <View style={styles.optionsGrid}>
              {distances.map((distance, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionChip,
                    localFilters.maxDistance === distance.value && styles.optionChipSelected
                  ]}
                  onPress={() => setLocalFilters(prev => ({ ...prev, maxDistance: distance.value }))}
                >
                  <Text style={[
                    styles.optionChipText,
                    localFilters.maxDistance === distance.value && styles.optionChipTextSelected
                  ]}>
                    {distance.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Star size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>Minimum Rating</Text>
            </View>
            <View style={styles.optionsGrid}>
              {ratings.map((rating, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionChip,
                    localFilters.minRating === rating.value && styles.optionChipSelected
                  ]}
                  onPress={() => setLocalFilters(prev => ({ ...prev, minRating: rating.value }))}
                >
                  <Text style={[
                    styles.optionChipText,
                    localFilters.minRating === rating.value && styles.optionChipTextSelected
                  ]}>
                    {rating.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Verified Only */}
          <View style={styles.section}>
            <View style={styles.switchRow}>
              <View style={styles.switchLabel}>
                <Star size={20} color="#667eea" />
                <Text style={styles.switchText}>Verified tutors only</Text>
              </View>
              <Switch
                value={localFilters.verified}
                onValueChange={(value) => setLocalFilters(prev => ({ ...prev, verified: value }))}
                trackColor={{ false: '#e5e7eb', true: '#667eea' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.applyButtonGradient}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  resetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  resetText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#333',
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subjectChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  subjectChipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  subjectChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  subjectChipTextSelected: {
    color: '#fff',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 100,
    alignItems: 'center',
  },
  optionChipSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  optionChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#666',
  },
  optionChipTextSelected: {
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#333',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  applyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
  },
});