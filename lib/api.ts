import { supabase } from './supabase';
import { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type StudyPlan = Database['public']['Tables']['study_plans']['Row'];
type Session = Database['public']['Tables']['sessions']['Row'];
type Match = Database['public']['Tables']['matches']['Row'];
type Conversation = Database['public']['Tables']['conversations']['Row'];
type Message = Database['public']['Tables']['messages']['Row'];
type Subject = Database['public']['Tables']['subjects']['Row'];
type TutorSubject = Database['public']['Tables']['tutor_subjects']['Row'];

// Profile API
export const profileApi = {
  async getTutors(limit = 10) {
    const { data, error } = await supabase
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
      .eq('role', 'tutor')
      .eq('verified', true)
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Study Plans API
export const studyPlansApi = {
  async getStudyPlans(userId: string) {
    const { data, error } = await supabase
      .from('study_plans')
      .select(`
        *,
        student:profiles!study_plans_student_id_fkey(first_name, last_name),
        tutor:profiles!study_plans_tutor_id_fkey(first_name, last_name)
      `)
      .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createStudyPlan(planData: {
    student_id: string;
    tutor_id: string;
    title: string;
    subject: string;
    description?: string;
    goals?: any[];
    due_date?: string;
  }) {
    const { data, error } = await supabase
      .from('study_plans')
      .insert(planData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStudyPlan(planId: string, updates: Partial<StudyPlan>) {
    const { data, error } = await supabase
      .from('study_plans')
      .update(updates)
      .eq('id', planId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Sessions API
export const sessionsApi = {
  async getSessions(userId: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        study_plan:study_plans (
          title,
          subject,
          student:profiles!study_plans_student_id_fkey(first_name, last_name),
          tutor:profiles!study_plans_tutor_id_fkey(first_name, last_name)
        )
      `)
      .in('study_plan_id', 
        supabase
          .from('study_plans')
          .select('id')
          .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
      )
      .order('scheduled_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async createSession(sessionData: {
    study_plan_id: string;
    scheduled_at: string;
    duration_minutes: number;
    type: 'video' | 'in_person';
    location?: string;
    notes?: string;
  }) {
    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSession(sessionId: string, updates: Partial<Session>) {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Matches API
export const matchesApi = {
  async getMatches(userId: string) {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        student:profiles!matches_student_id_fkey(first_name, last_name, avatar_url, university, major),
        tutor:profiles!matches_tutor_id_fkey(first_name, last_name, avatar_url, university, major, rating, hourly_rate)
      `)
      .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createMatch(studentId: string, tutorId: string) {
    const { data, error } = await supabase
      .from('matches')
      .insert({
        student_id: studentId,
        tutor_id: tutorId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMatchStatus(matchId: string, status: 'pending' | 'matched' | 'rejected') {
    const { data, error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Messages API
export const messagesApi = {
  async getConversations(userId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        match:matches (
          student:profiles!matches_student_id_fkey(first_name, last_name, avatar_url),
          tutor:profiles!matches_tutor_id_fkey(first_name, last_name, avatar_url)
        ),
        messages (
          content,
          created_at,
          sender_id
        )
      `)
      .in('match_id',
        supabase
          .from('matches')
          .select('id')
          .or(`student_id.eq.${userId},tutor_id.eq.${userId}`)
          .eq('status', 'matched')
      )
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(first_name, last_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  },

  async createConversation(matchId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({ match_id: matchId })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Subjects API
export const subjectsApi = {
  async getSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getTutorSubjects(tutorId: string) {
    const { data, error } = await supabase
      .from('tutor_subjects')
      .select(`
        *,
        subject:subjects(name, category)
      `)
      .eq('tutor_id', tutorId);

    if (error) throw error;
    return data;
  },

  async addTutorSubjects(tutorId: string, subjectIds: string[], proficiencyLevel: string) {
    const tutorSubjects = subjectIds.map(subjectId => ({
      tutor_id: tutorId,
      subject_id: subjectId,
      proficiency_level: proficiencyLevel as 'beginner' | 'intermediate' | 'advanced' | 'expert'
    }));

    const { data, error } = await supabase
      .from('tutor_subjects')
      .insert(tutorSubjects)
      .select();

    if (error) throw error;
    return data;
  }
};

// Real-time subscriptions
export const subscriptions = {
  subscribeToMessages(conversationId: string, callback: (message: any) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToMatches(userId: string, callback: (match: any) => void) {
    return supabase
      .channel(`matches:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `student_id=eq.${userId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `tutor_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
};