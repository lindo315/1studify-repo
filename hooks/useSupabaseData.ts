import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Hook for fetching tutors
export function useTutors() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTutors() {
      try {
        setLoading(true);
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
          .limit(20);

        if (error) throw error;
        setTutors(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTutors();
  }, []);

  return { tutors, loading, error };
}

// Hook for study plans
export function useStudyPlans() {
  const { user } = useAuth();
  const [studyPlans, setStudyPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setStudyPlans([]);
      setLoading(false);
      return;
    }

    async function fetchStudyPlans() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('study_plans')
          .select(`
            *,
            student:profiles!study_plans_student_id_fkey(first_name, last_name),
            tutor:profiles!study_plans_tutor_id_fkey(first_name, last_name)
          `)
          .or(`student_id.eq.${user.id},tutor_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setStudyPlans(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStudyPlans();
  }, [user]);

  const createStudyPlan = async (planData: any) => {
    try {
      const { data, error } = await supabase
        .from('study_plans')
        .insert(planData)
        .select()
        .single();

      if (error) throw error;
      setStudyPlans(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateStudyPlan = async (planId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('study_plans')
        .update(updates)
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      setStudyPlans(prev => prev.map(plan => 
        plan.id === planId ? data : plan
      ));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { 
    studyPlans, 
    loading, 
    error, 
    createStudyPlan, 
    updateStudyPlan 
  };
}

// Hook for sessions
export function useSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    async function fetchSessions() {
      try {
        setLoading(true);
        // First get study plan IDs for the user
        const { data: studyPlans, error: plansError } = await supabase
          .from('study_plans')
          .select('id')
          .or(`student_id.eq.${user.id},tutor_id.eq.${user.id}`);

        if (plansError) throw plansError;

        if (!studyPlans || studyPlans.length === 0) {
          setSessions([]);
          setLoading(false);
          return;
        }

        const planIds = studyPlans.map(plan => plan.id);

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
          .in('study_plan_id', planIds)
          .order('scheduled_at', { ascending: true });

        if (error) throw error;
        setSessions(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [user]);

  const createSession = async (sessionData: any) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;
      setSessions(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateSession = async (sessionId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? data : session
      ));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { 
    sessions, 
    loading, 
    error, 
    createSession, 
    updateSession 
  };
}

// Hook for matches
export function useMatches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setMatches([]);
      setLoading(false);
      return;
    }

    async function fetchMatches() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('matches')
          .select(`
            *,
            student:profiles!matches_student_id_fkey(first_name, last_name, avatar_url, university, major),
            tutor:profiles!matches_tutor_id_fkey(first_name, last_name, avatar_url, university, major, rating, hourly_rate)
          `)
          .or(`student_id.eq.${user.id},tutor_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMatches(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMatches();
  }, [user]);

  const createMatch = async (tutorId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert({
          student_id: user.id,
          tutor_id: tutorId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      setMatches(prev => [data, ...prev]);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateMatchStatus = async (matchId: string, status: 'pending' | 'matched' | 'rejected') => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;
      setMatches(prev => prev.map(match => 
        match.id === matchId ? data : match
      ));
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { 
    matches, 
    loading, 
    error, 
    createMatch, 
    updateMatchStatus 
  };
}

// Hook for conversations and messages
export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    async function fetchConversations() {
      try {
        setLoading(true);
        // First get matches for the user
        const { data: userMatches, error: matchesError } = await supabase
          .from('matches')
          .select('id')
          .or(`student_id.eq.${user.id},tutor_id.eq.${user.id}`)
          .eq('status', 'matched');

        if (matchesError) throw matchesError;

        if (!userMatches || userMatches.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }

        const matchIds = userMatches.map(match => match.id);

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
          .in('match_id', matchIds)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setConversations(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [user]);

  return { conversations, loading, error };
}

// Hook for messages in a specific conversation
export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    async function fetchMessages() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles(first_name, last_name, avatar_url)
          `)
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!conversationId) throw new Error('No conversation selected');
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: 'current_user', // This should be replaced with actual user ID
          content
        })
        .select()
        .single();

      if (error) throw error;
      
      setMessages(prev => [...prev, data]);
      
      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);
      
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return { messages, loading, error, sendMessage };
}

// Hook for subjects
export function useSubjects() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('category', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;
        setSubjects(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, []);

  return { subjects, loading, error };
}