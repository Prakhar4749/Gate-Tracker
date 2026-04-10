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
      subjects: {
        Row: {
          id: string
          name: string
          short_code: string
          phase: number
          gate_weightage_marks: number
          strength_level: string
          color_hex: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          short_code: string
          phase: number
          gate_weightage_marks?: number
          strength_level: string
          color_hex?: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_code?: string
          phase?: number
          gate_weightage_marks?: number
          strength_level?: string
          color_hex?: string
          sort_order?: number
          created_at?: string
        }
      }
      topics: {
        Row: {
          id: string
          subject_id: string
          name: string
          subtopics: string[]
          priority: string
          estimated_hours: number
          pyq_count: number
          status: string
          notes: string
          last_studied_at: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          name: string
          subtopics?: string[]
          priority?: string
          estimated_hours?: number
          pyq_count?: number
          status?: string
          notes?: string
          last_studied_at?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          subject_id?: string
          name?: string
          subtopics?: string[]
          priority?: string
          estimated_hours?: number
          pyq_count?: number
          status?: string
          notes?: string
          last_studied_at?: string | null
          sort_order?: number
          created_at?: string
        }
      }
      daily_logs: {
        Row: {
          id: string
          log_date: string
          subject_id: string | null
          topic_id: string | null
          hours_studied: number
          topics_covered: string[]
          notes: string
          mood: string
          productivity_score: number
          pyqs_solved: number
          pyqs_correct: number
          created_at: string
        }
        Insert: {
          id?: string
          log_date: string
          subject_id?: string | null
          topic_id?: string | null
          hours_studied?: number
          topics_covered?: string[]
          notes?: string
          mood?: string
          productivity_score?: number
          pyqs_solved?: number
          pyqs_correct?: number
          created_at?: string
        }
        Update: {
          id?: string
          log_date?: string
          subject_id?: string | null
          topic_id?: string | null
          hours_studied?: number
          topics_covered?: string[]
          notes?: string
          mood?: string
          productivity_score?: number
          pyqs_solved?: number
          pyqs_correct?: number
          created_at?: string
        }
      }
      mock_tests: {
        Row: {
          id: string
          test_name: string
          test_series: string
          test_date: string
          total_marks: number
          scored_marks: number
          total_questions: number
          attempted: number
          correct: number
          wrong: number
          time_taken_minutes: number
          subject_scores: Json
          topic_errors: Json
          notes: string
          raw_import_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          test_name: string
          test_series: string
          test_date: string
          total_marks?: number
          scored_marks?: number
          total_questions?: number
          attempted?: number
          correct?: number
          wrong?: number
          time_taken_minutes?: number
          subject_scores?: Json
          topic_errors?: Json
          notes?: string
          raw_import_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          test_name?: string
          test_series?: string
          test_date?: string
          total_marks?: number
          scored_marks?: number
          total_questions?: number
          attempted?: number
          correct?: number
          wrong?: number
          time_taken_minutes?: number
          subject_scores?: Json
          topic_errors?: Json
          notes?: string
          raw_import_data?: Json
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          subject_id: string | null
          topic_id: string | null
          content: string
          tags: string[]
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subject_id?: string | null
          topic_id?: string | null
          content?: string
          tags?: string[]
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subject_id?: string | null
          topic_id?: string | null
          content?: string
          tags?: string[]
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      score_projections: {
        Row: {
          id: string
          projected_score: number
          confidence_level: string
          basis: string
          subjects_completed: number
          total_subjects: number
          recorded_at: string
        }
        Insert: {
          id?: string
          projected_score: number
          confidence_level?: string
          basis?: string
          subjects_completed?: number
          total_subjects?: number
          recorded_at?: string
        }
        Update: {
          id?: string
          projected_score?: number
          confidence_level?: string
          basis?: string
          subjects_completed?: number
          total_subjects?: number
          recorded_at?: string
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
  }
}
