// src/lib/supabase/database.types.ts
// Permissive V1 types so the app builds before codegen.
// Regenerate real types after Supabase setup with:
//   npx supabase gen types typescript --project-id <ref> --schema public > src/lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type AnyTable = {
  Row: any
  Insert: any
  Update: any
  Relationships: []
}

export interface Database {
  public: {
    Tables: {
      profiles: AnyTable
      levels: AnyTable
      skill_domains: AnyTable
      skill_nodes: AnyTable
      user_skill_progress: AnyTable
      missions: AnyTable
      mission_tasks: AnyTable
      xp_transactions: AnyTable
      assessments: AnyTable
      user_assessment_results: AnyTable
      projects: AnyTable
      interview_questions: AnyTable
      user_interview_attempts: AnyTable
      mock_interview_sessions: AnyTable
      daily_activity: AnyTable
      readiness_snapshots: AnyTable
      achievements: AnyTable
      user_achievements: AnyTable
      coach_conversations: AnyTable
      market_intelligence: AnyTable
    }
    Views: { [key: string]: never }
    Functions: { [key: string]: never }
    Enums: { [key: string]: never }
    CompositeTypes: { [key: string]: never }
  }
}
