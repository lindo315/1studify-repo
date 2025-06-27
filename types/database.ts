export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'student' | 'tutor'
          university: string | null
          major: string | null
          bio: string | null
          avatar_url: string | null
          rating: number | null
          hourly_rate: number | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'student' | 'tutor'
          university?: string | null
          major?: string | null
          bio?: string | null
          avatar_url?: string | null
          rating?: number | null
          hourly_rate?: number | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'student' | 'tutor'
          university?: string | null
          major?: string | null
          bio?: string | null
          avatar_url?: string | null
          rating?: number | null
          hourly_rate?: number | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          created_at?: string
        }
      }
      tutor_subjects: {
        Row: {
          id: string
          tutor_id: string
          subject_id: string
          proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          created_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          subject_id: string
          proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          created_at?: string
        }
        Update: {
          id?: string
          tutor_id?: string
          subject_id?: string
          proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          student_id: string
          tutor_id: string
          status: 'pending' | 'matched' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          tutor_id: string
          status?: 'pending' | 'matched' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          tutor_id?: string
          status?: 'pending' | 'matched' | 'rejected'
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          match_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          match_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          created_at?: string
        }
      }
      study_plans: {
        Row: {
          id: string
          student_id: string
          tutor_id: string
          title: string
          subject: string
          description: string | null
          goals: Json
          progress: number
          status: 'active' | 'completed' | 'paused'
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          tutor_id: string
          title: string
          subject: string
          description?: string | null
          goals?: Json
          progress?: number
          status?: 'active' | 'completed' | 'paused'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          tutor_id?: string
          title?: string
          subject?: string
          description?: string | null
          goals?: Json
          progress?: number
          status?: 'active' | 'completed' | 'paused'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          study_plan_id: string
          scheduled_at: string
          duration_minutes: number
          type: 'video' | 'in_person'
          location: string | null
          status: 'scheduled' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          study_plan_id: string
          scheduled_at: string
          duration_minutes: number
          type: 'video' | 'in_person'
          location?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          study_plan_id?: string
          scheduled_at?: string
          duration_minutes?: number
          type?: 'video' | 'in_person'
          location?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewee_id: string
          session_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reviewer_id: string
          reviewee_id: string
          session_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reviewer_id?: string
          reviewee_id?: string
          session_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}