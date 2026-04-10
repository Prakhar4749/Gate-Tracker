export interface Subject {
  id: string;
  name: string;
  short_code: string;
  phase: 1 | 2 | 3 | 4;
  gate_weightage_marks: number;
  strength_level: 'strong' | 'focus' | 'build';
  color_hex: string;
  sort_order: number;
  created_at: string;
  topics?: Topic[]; // populated on join
  combo_id?: number | null;
  primary_teacher?: string;
  backup_teacher?: string;
  ideal_days_medium?: number;
  lifecycle_step?: number;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  subtopics: string[];
  priority: 'high' | 'medium' | 'low';
  estimated_hours: number;
  pyq_count: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'needs_revision';
  notes: string;
  last_studied_at: string | null;
  sort_order: number;
  created_at: string;
  subject?: Subject; // populated on join
  lifecycle_step?: number;
  combo_id?: number | null;
}

export interface DailyLog {
  id: string;
  log_date: string;
  subject_id: string | null;
  topic_id: string | null;
  hours_studied: number;
  topics_covered: string[];
  notes: string;
  mood: 'great' | 'okay' | 'tired' | 'stressed';
  productivity_score: number;
  pyqs_solved: number;
  pyqs_correct: number;
  created_at: string;
  subject?: Subject;
  topic?: Topic;
}

export interface MockTest {
  id: string;
  test_name: string;
  test_series: string;
  test_date: string;
  total_marks: number;
  scored_marks: number;
  total_questions: number;
  attempted: number;
  correct: number;
  wrong: number;
  time_taken_minutes: number;
  subject_scores: Record<string, number>;
  topic_errors: Record<string, number>;
  notes: string;
  raw_import_data: Record<string, unknown>;
  created_at: string;
}

export interface Note {
  id: string;
  title: string;
  subject_id: string | null;
  topic_id: string | null;
  content: string;
  tags: string[];
  is_pinned: boolean;
  note_type: 'general' | 'mistake' | 'formula' | 'weak_topic';
  created_at: string;
  updated_at: string;
  subject?: Subject;
  topic?: Topic;
}

export type NoteType = 'general' | 'mistake' | 'formula' | 'weak_topic';

export interface ScoreProjection {
  id: string;
  projected_score: number;
  confidence_level: 'low' | 'medium' | 'high';
  basis: string;
  subjects_completed: number;
  total_subjects: number;
  recorded_at: string;
}

export interface PracticeResource {
  id: string;
  subject_id: string;
  url: string;
  resource_type: 'youtube_video' | 'youtube_playlist' | 'youtube_live';
  is_playlist: boolean;
  sort_order: number;
  created_at: string;
  subject?: Subject;
  is_watched?: boolean; // joined or from local state
}

export interface WatchedResource {
  id: string;
  resource_id: string;
  created_at: string;
}

export type MoodType = 'great' | 'okay' | 'tired' | 'stressed';
export type StatusType = 'not_started' | 'in_progress' | 'completed' | 'needs_revision';
export type StrengthType = 'strong' | 'focus' | 'build';
export type PriorityType = 'high' | 'medium' | 'low';
