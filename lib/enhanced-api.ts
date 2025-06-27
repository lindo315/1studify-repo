import { supabase } from './supabase';
import { TutorFilters, MatchPreferences, PerformanceAnalysis, StudyResource, CallSession } from '@/types/enhancements';

// Enhanced Profile API
export const enhancedProfileApi = {
  async uploadProfilePhoto(userId: string, imageUri: string) {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const fileExt = imageUri.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      return { url: publicUrl, error: null };
    } catch (error: any) {
      return { url: null, error: error.message };
    }
  },

  async updateMatchPreferences(userId: string, preferences: MatchPreferences) {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        learning_style: { type: preferences.learningStyle },
        availability_schedule: { slots: preferences.availability },
        match_preferences: {
          subjects: preferences.preferredSubjects,
          sessionType: preferences.sessionType,
          maxDistance: preferences.maxDistance,
          budgetRange: preferences.budgetRange
        }
      });

    if (error) throw error;
  },

  async getMatchPreferences(userId: string): Promise<MatchPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;

    return {
      preferredSubjects: data.match_preferences?.subjects || [],
      learningStyle: data.learning_style?.type || 'visual',
      sessionType: data.match_preferences?.sessionType || 'both',
      maxDistance: data.match_preferences?.maxDistance || 25,
      budgetRange: data.match_preferences?.budgetRange || [20, 100],
      availability: data.availability_schedule?.slots || []
    };
  }
};

// Enhanced Matching API
export const enhancedMatchingApi = {
  async getFilteredTutors(filters: TutorFilters, limit = 20) {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        tutor_subjects (
          proficiency_level,
          subjects (
            name,
            category
          )
        )
      `)
      .eq('role', 'tutor');

    // Apply filters
    if (filters.verified) {
      query = query.eq('verified', true);
    }

    if (filters.minRating > 0) {
      query = query.gte('rating', filters.minRating);
    }

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) {
      query = query
        .gte('hourly_rate', filters.priceRange[0])
        .lte('hourly_rate', filters.priceRange[1]);
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;

    // Filter by subjects if specified
    if (filters.subjects.length > 0) {
      return data?.filter(tutor => 
        tutor.tutor_subjects?.some((ts: any) => 
          filters.subjects.includes(ts.subjects?.name)
        )
      ) || [];
    }

    return data || [];
  },

  calculateMatchScore(studentPrefs: MatchPreferences, tutor: any): number {
    let score = 0;
    const maxScore = 100;

    // Subject match (40% weight)
    const subjectMatch = studentPrefs.preferredSubjects.some(subject =>
      tutor.tutor_subjects?.some((ts: any) => ts.subjects?.name === subject)
    );
    if (subjectMatch) score += 40;

    // Price compatibility (25% weight)
    const tutorRate = tutor.hourly_rate || 0;
    if (tutorRate >= studentPrefs.budgetRange[0] && tutorRate <= studentPrefs.budgetRange[1]) {
      score += 25;
    }

    // Rating (20% weight)
    const rating = tutor.rating || 0;
    score += (rating / 5) * 20;

    // Verification status (15% weight)
    if (tutor.verified) score += 15;

    return Math.min(score, maxScore);
  }
};

// AI Learning Assistant API
export const aiLearningApi = {
  async analyzeStudentPerformance(userId: string): Promise<PerformanceAnalysis> {
    // Get user's session data and study plans
    const { data: sessions } = await supabase
      .from('sessions')
      .select(`
        *,
        study_plan:study_plans(*)
      `)
      .in('study_plan_id', 
        supabase
          .from('study_plans')
          .select('id')
          .eq('student_id', userId)
      )
      .eq('status', 'completed');

    const { data: studyPlans } = await supabase
      .from('study_plans')
      .select('*')
      .eq('student_id', userId);

    // Calculate performance metrics
    const totalSessions = sessions?.length || 0;
    const avgProgress = studyPlans?.reduce((acc, plan) => acc + plan.progress, 0) / (studyPlans?.length || 1);
    
    // Mock AI analysis - in production, this would call an AI service
    return {
      overallProgress: Math.round(avgProgress),
      strengths: ['Problem-solving', 'Consistent practice'],
      areasForImprovement: ['Time management', 'Advanced concepts'],
      recommendedStudyTime: Math.max(30, 120 - totalSessions * 5),
      nextMilestones: ['Complete current study plan', 'Start advanced topics']
    };
  },

  async recommendStudyMaterials(subject: string, currentLevel: string): Promise<StudyResource[]> {
    // Mock recommendations - in production, this would use AI/ML
    const resources: StudyResource[] = [
      {
        id: '1',
        title: `${subject} Fundamentals`,
        type: 'video',
        url: 'https://example.com/video1',
        difficulty: currentLevel as any,
        estimatedTime: 30
      },
      {
        id: '2',
        title: `Practice Problems: ${subject}`,
        type: 'exercise',
        url: 'https://example.com/exercises1',
        difficulty: currentLevel as any,
        estimatedTime: 45
      }
    ];

    return resources;
  }
};

// Enhanced Communication API
export const enhancedCommunicationApi = {
  async initiateVideoCall(conversationId: string, participants: string[]): Promise<CallSession> {
    // In production, integrate with Agora.io or Twilio
    const callSession: CallSession = {
      id: `call_${Date.now()}`,
      conversationId,
      participants,
      status: 'connecting',
      startTime: new Date()
    };

    // Store call session in database
    await supabase
      .from('call_sessions')
      .insert({
        id: callSession.id,
        conversation_id: conversationId,
        participants: participants,
        status: callSession.status,
        started_at: callSession.startTime.toISOString()
      });

    return callSession;
  },

  async uploadSessionFile(sessionId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `sessions/${sessionId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('session-files')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('session-files')
      .getPublicUrl(fileName);

    // Record file in database
    await supabase
      .from('session_files')
      .insert({
        session_id: sessionId,
        file_type: 'document',
        file_url: publicUrl,
        file_size: file.size,
        uploaded_by: 'current_user' // Replace with actual user ID
      });

    return { url: publicUrl, type: file.type };
  }
};

// Calendar Integration API
export const calendarApi = {
  async findOptimalMeetingTimes(participants: string[], duration: number) {
    // Get availability for all participants
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('availability_schedule')
      .in('user_id', participants);

    // Mock optimal time finding - in production, implement smart scheduling
    const optimalTimes = [
      {
        day: 'Monday',
        startTime: '14:00',
        endTime: '15:00'
      },
      {
        day: 'Wednesday',
        startTime: '16:00',
        endTime: '17:00'
      }
    ];

    return optimalTimes;
  },

  async scheduleSession(sessionData: any) {
    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) throw error;

    // In production, send calendar invites via Google Calendar API
    // await this.sendCalendarInvites(data.id, sessionData.participants);

    return data;
  }
};

// Gamification API
export const gamificationApi = {
  async awardAchievement(userId: string, achievementId: string) {
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId
      });

    if (error && error.code !== '23505') { // Ignore duplicate key errors
      throw error;
    }
  },

  async getUserAchievements(userId: string) {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async updateUserLevel(userId: string, xpGained: number) {
    // Get current user level
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, level')
      .eq('id', userId)
      .single();

    const currentXp = (profile?.xp || 0) + xpGained;
    const newLevel = Math.floor(currentXp / 1000) + 1; // 1000 XP per level

    await supabase
      .from('profiles')
      .update({ 
        xp: currentXp, 
        level: newLevel 
      })
      .eq('id', userId);

    return {
      level: newLevel,
      xp: currentXp,
      xpToNextLevel: 1000 - (currentXp % 1000),
      title: this.getLevelTitle(newLevel)
    };
  },

  getLevelTitle(level: number): string {
    if (level < 5) return 'Beginner';
    if (level < 10) return 'Student';
    if (level < 20) return 'Scholar';
    if (level < 50) return 'Expert';
    return 'Master';
  }
};