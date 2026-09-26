export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assessment_attempts: {
        Row: {
          assessment_id: string
          attempt_number: number
          course_id: string
          duration_seconds: number | null
          id: string
          passed: boolean | null
          points_earned: number | null
          points_possible: number | null
          score: number | null
          started_at: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          assessment_id: string
          attempt_number: number
          course_id: string
          duration_seconds?: number | null
          id?: string
          passed?: boolean | null
          points_earned?: number | null
          points_possible?: number | null
          score?: number | null
          started_at?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          assessment_id?: string
          attempt_number?: number
          course_id?: string
          duration_seconds?: number | null
          id?: string
          passed?: boolean | null
          points_earned?: number | null
          points_possible?: number | null
          score?: number | null
          started_at?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_attempts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_seat_counts"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "assessment_attempts_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          assessment_id: string
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty"]
          explanation: string | null
          id: string
          points: number
          position: number
          prompt: string
          remedial_module_id: string | null
          tags: string[]
          type: Database["public"]["Enums"]["question_type"]
        }
        Insert: {
          assessment_id: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          explanation?: string | null
          id?: string
          points?: number
          position?: number
          prompt: string
          remedial_module_id?: string | null
          tags?: string[]
          type?: Database["public"]["Enums"]["question_type"]
        }
        Update: {
          assessment_id?: string
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty"]
          explanation?: string | null
          id?: string
          points?: number
          position?: number
          prompt?: string
          remedial_module_id?: string | null
          tags?: string[]
          type?: Database["public"]["Enums"]["question_type"]
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_questions_remedial_module_id_fkey"
            columns: ["remedial_module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          description: string
          gates_entry_pass: boolean
          id: string
          kind: Database["public"]["Enums"]["assessment_kind"]
          max_attempts: number
          module_id: string | null
          passing_score: number
          status: Database["public"]["Enums"]["assessment_status"]
          time_limit_minutes: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          description?: string
          gates_entry_pass?: boolean
          id?: string
          kind?: Database["public"]["Enums"]["assessment_kind"]
          max_attempts?: number
          module_id?: string | null
          passing_score?: number
          status?: Database["public"]["Enums"]["assessment_status"]
          time_limit_minutes?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          gates_entry_pass?: boolean
          id?: string
          kind?: Database["public"]["Enums"]["assessment_kind"]
          max_attempts?: number
          module_id?: string | null
          passing_score?: number
          status?: Database["public"]["Enums"]["assessment_status"]
          time_limit_minutes?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_seat_counts"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "assessments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      attempt_answers: {
        Row: {
          attempt_id: string
          correct: boolean | null
          id: string
          points_earned: number | null
          question_id: string
          selected_option_ids: string[]
        }
        Insert: {
          attempt_id: string
          correct?: boolean | null
          id?: string
          points_earned?: number | null
          question_id: string
          selected_option_ids?: string[]
        }
        Update: {
          attempt_id?: string
          correct?: boolean | null
          id?: string
          points_earned?: number | null
          question_id?: string
          selected_option_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "assessment_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          check_in_time: string | null
          client_record_id: string | null
          device_id: string | null
          id: string
          marked_by: string | null
          method: Database["public"]["Enums"]["attendance_method"]
          session_id: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at: string
        }
        Insert: {
          check_in_time?: string | null
          client_record_id?: string | null
          device_id?: string | null
          id?: string
          marked_by?: string | null
          method?: Database["public"]["Enums"]["attendance_method"]
          session_id: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          updated_at?: string
        }
        Update: {
          check_in_time?: string | null
          client_record_id?: string | null
          device_id?: string | null
          id?: string
          marked_by?: string | null
          method?: Database["public"]["Enums"]["attendance_method"]
          session_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string
          actor_role: Database["public"]["Enums"]["user_role"] | null
          created_at: string
          details: string
          id: string
          target: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string
          details?: string
          id?: string
          target?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string
          actor_role?: Database["public"]["Enums"]["user_role"] | null
          created_at?: string
          details?: string
          id?: string
          target?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          course_id: string
          credential_id: string
          id: string
          issued_at: string
          revoked_at: string | null
          storage_path: string | null
          student_id: string
        }
        Insert: {
          course_id: string
          credential_id: string
          id?: string
          issued_at?: string
          revoked_at?: string | null
          storage_path?: string | null
          student_id: string
        }
        Update: {
          course_id?: string
          credential_id?: string
          id?: string
          issued_at?: string
          revoked_at?: string | null
          storage_path?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_seat_counts"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_applications: {
        Row: {
          course_id: string
          employer: string
          experience: string
          id: string
          motivation: string
          payment_evidence_path: string
          phone: string
          review_note: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          student_id: string
          submitted_at: string
        }
        Insert: {
          course_id: string
          employer?: string
          experience?: string
          id?: string
          motivation?: string
          payment_evidence_path?: string
          phone?: string
          review_note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id: string
          submitted_at?: string
        }
        Update: {
          course_id?: string
          employer?: string
          experience?: string
          id?: string
          motivation?: string
          payment_evidence_path?: string
          phone?: string
          review_note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_applications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_seat_counts"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "course_applications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_applications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      course_fee_tiers: {
        Row: {
          amount: number
          course_id: string
          id: string
          name: string
          position: number
        }
        Insert: {
          amount: number
          course_id: string
          id?: string
          name: string
          position?: number
        }
        Update: {
          amount?: number
          course_id?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "course_fee_tiers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_seat_counts"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "course_fee_tiers_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          position: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          position?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_seat_counts"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sessions: {
        Row: {
          capacity: number | null
          course_id: string
          created_at: string
          ends_at: string
          id: string
          instructor_id: string | null
          meeting_url: string
          room_number: string
          session_date: string
          starts_at: string
          title: string
          venue_id: string | null
          venue_name: string
        }
        Insert: {
          capacity?: number | null
          course_id: string
          created_at?: string
          ends_at: string
          id?: string
          instructor_id?: string | null
          meeting_url?: string
          room_number?: string
          session_date: string
          starts_at: string
          title: string
          venue_id?: string | null
          venue_name?: string
        }
        Update: {
          capacity?: number | null
          course_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          instructor_id?: string | null
          meeting_url?: string
          room_number?: string
          session_date?: string
          starts_at?: string
          title?: string
          venue_id?: string | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_seat_counts"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "course_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_sessions_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_sessions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          application_fee: number
          category: string
          created_at: string
          description: string
          duration: string
          fee_amount: number | null
          fee_type: Database["public"]["Enums"]["fee_type"]
          id: string
          image_url: string | null
          instructor_id: string | null
          location: string
          seats_total: number
          status: Database["public"]["Enums"]["course_status"]
          title: string
          updated_at: string
        }
        Insert: {
          application_fee?: number
          category: string
          created_at?: string
          description?: string
          duration?: string
          fee_amount?: number | null
          fee_type?: Database["public"]["Enums"]["fee_type"]
          id?: string
          image_url?: string | null
          instructor_id?: string | null
          location?: string
          seats_total?: number
          status?: Database["public"]["Enums"]["course_status"]
          title: string
          updated_at?: string
        }
        Update: {
          application_fee?: number
          category?: string
          created_at?: string
          description?: string
          duration?: string
          fee_amount?: number | null
          fee_type?: Database["public"]["Enums"]["fee_type"]
          id?: string
          image_url?: string | null
          instructor_id?: string | null
          location?: string
          seats_total?: number
          status?: Database["public"]["Enums"]["course_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      device_sync_logs: {
        Row: {
          device_id: string
          error_detail: string | null
          id: string
          instructor_id: string | null
          record_count: number
          status: Database["public"]["Enums"]["sync_status"]
          synced_at: string
        }
        Insert: {
          device_id: string
          error_detail?: string | null
          id?: string
          instructor_id?: string | null
          record_count?: number
          status?: Database["public"]["Enums"]["sync_status"]
          synced_at?: string
        }
        Update: {
          device_id?: string
          error_detail?: string | null
          id?: string
          instructor_id?: string | null
          record_count?: number
          status?: Database["public"]["Enums"]["sync_status"]
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_sync_logs_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          id: string
          last_item_id: string | null
          progress: number
          status: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          id?: string
          last_item_id?: string | null
          progress?: number
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          id?: string
          last_item_id?: string | null
          progress?: number
          status?: Database["public"]["Enums"]["enrollment_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_seat_counts"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_last_item_id_fkey"
            columns: ["last_item_id"]
            isOneToOne: false
            referencedRelation: "module_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_passes: {
        Row: {
          id: string
          issued_at: string
          pass_code: string
          session_id: string
          status: Database["public"]["Enums"]["pass_status"]
          student_id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          id?: string
          issued_at?: string
          pass_code: string
          session_id: string
          status?: Database["public"]["Enums"]["pass_status"]
          student_id: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          id?: string
          issued_at?: string
          pass_code?: string
          session_id?: string
          status?: Database["public"]["Enums"]["pass_status"]
          student_id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entry_passes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_passes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_passes_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      institution_settings: {
        Row: {
          contacts: string[]
          enrollment_rule: string
          facilities: string[]
          id: boolean
          special_package_rule: string
          updated_at: string
        }
        Insert: {
          contacts?: string[]
          enrollment_rule?: string
          facilities?: string[]
          id?: boolean
          special_package_rule?: string
          updated_at?: string
        }
        Update: {
          contacts?: string[]
          enrollment_rule?: string
          facilities?: string[]
          id?: boolean
          special_package_rule?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string
          enrollment_id: string
          id: string
          module_item_id: string
        }
        Insert: {
          completed_at?: string
          enrollment_id: string
          id?: string
          module_item_id: string
        }
        Update: {
          completed_at?: string
          enrollment_id?: string
          id?: string
          module_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_module_item_id_fkey"
            columns: ["module_item_id"]
            isOneToOne: false
            referencedRelation: "module_items"
            referencedColumns: ["id"]
          },
        ]
      }
      module_items: {
        Row: {
          assessment_id: string | null
          created_at: string
          external_url: string | null
          id: string
          module_id: string
          notes: string | null
          position: number
          storage_path: string | null
          title: string
          type: Database["public"]["Enums"]["module_item_type"]
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          module_id: string
          notes?: string | null
          position?: number
          storage_path?: string | null
          title: string
          type: Database["public"]["Enums"]["module_item_type"]
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          module_id?: string
          notes?: string | null
          position?: number
          storage_path?: string | null
          title?: string
          type?: Database["public"]["Enums"]["module_item_type"]
        }
        Relationships: [
          {
            foreignKeyName: "module_items_assessment_fk"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_items_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          course_id: string | null
          created_at: string
          currency: string
          enrollment_id: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          provider_ref: string | null
          purpose: Database["public"]["Enums"]["payment_purpose"]
          reference: string
          settled_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          student_id: string
        }
        Insert: {
          amount: number
          course_id?: string | null
          created_at?: string
          currency?: string
          enrollment_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          provider_ref?: string | null
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          reference: string
          settled_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id: string
        }
        Update: {
          amount?: number
          course_id?: string | null
          created_at?: string
          currency?: string
          enrollment_id?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          provider_ref?: string | null
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          reference?: string
          settled_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_seat_counts"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          id: string
          is_correct: boolean
          label: string
          position: number
          question_id: string
        }
        Insert: {
          id?: string
          is_correct?: boolean
          label: string
          position?: number
          question_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean
          label?: string
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      subjective_grades: {
        Row: {
          created_at: string
          graded_by: string | null
          id: string
          notes: string | null
          score: number
          session_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          graded_by?: string | null
          id?: string
          notes?: string | null
          score: number
          session_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          graded_by?: string | null
          id?: string
          notes?: string | null
          score?: number
          session_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjective_grades_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjective_grades_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "course_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjective_grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          capacity: number
          created_at: string
          id: string
          name: string
        }
        Insert: {
          capacity: number
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          course_id: string
          id: string
          position: number
          requested_at: string
          status: Database["public"]["Enums"]["waitlist_status"]
          student_id: string
        }
        Insert: {
          course_id: string
          id?: string
          position: number
          requested_at?: string
          status?: Database["public"]["Enums"]["waitlist_status"]
          student_id: string
        }
        Update: {
          course_id?: string
          id?: string
          position?: number
          requested_at?: string
          status?: Database["public"]["Enums"]["waitlist_status"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course_seat_counts"
            referencedColumns: ["course_id"]
          },
          {
            foreignKeyName: "waitlist_entries_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      course_seat_counts: {
        Row: {
          course_id: string | null
          seats_taken: number | null
          seats_total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      analytics_course_health: {
        Args: never
        Returns: {
          attendance: number
          category: string
          completion: number
          pass_rate: number
          retention: number
          seats_filled: number
        }[]
      }
      analytics_funnel: {
        Args: never
        Returns: {
          stage: string
          value: number
        }[]
      }
      analytics_journey: { Args: never; Returns: Json }
      analytics_overview: { Args: never; Returns: Json }
      analytics_payment_mix: {
        Args: never
        Returns: {
          amount: number
          method: string
        }[]
      }
      analytics_retention: {
        Args: never
        Returns: {
          cohort: string
          retained: number
          size: number
          week: number
        }[]
      }
      analytics_revenue: {
        Args: { p_months?: number }
        Returns: {
          application_fee: number
          month: string
          tuition: number
        }[]
      }
      analytics_throughput: {
        Args: { p_weeks?: number }
        Returns: {
          attempts: number
          passes: number
          week: string
        }[]
      }
      analytics_top_courses: {
        Args: { p_limit?: number }
        Returns: {
          course: string
          enrolled: number
          pass_rate: number
          revenue: number
        }[]
      }
      apply_for_course: {
        Args: {
          p_course_id: string
          p_employer?: string
          p_evidence?: string
          p_experience?: string
          p_motivation?: string
          p_phone?: string
        }
        Returns: Json
      }
      assessment_authoring_payload: {
        Args: { p_assessment_id: string }
        Returns: Json
      }
      assessment_keys: {
        Args: never
        Returns: {
          option_id: string
          question_id: string
        }[]
      }
      attempt_result: { Args: { p_attempt_id: string }; Returns: Json }
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      backfill_attempt_answers: { Args: never; Returns: number }
      blocking_assessment: {
        Args: { p_course_id: string; p_student_id: string }
        Returns: string
      }
      checkout_course: {
        Args: {
          p_course_id: string
          p_method?: Database["public"]["Enums"]["payment_method"]
        }
        Returns: Json
      }
      enroll_in_course: { Args: { p_course_id: string }; Returns: Json }
      entry_pass_qr: { Args: { p_pass_id: string }; Returns: Json }
      entry_pass_signature: {
        Args: { p_pass_id: string; p_session_id: string }
        Returns: string
      }
      entry_pass_unlocked: {
        Args: { p_course_id: string; p_student_id: string }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      join_waitlist: { Args: { p_course_id: string }; Returns: Json }
      log_audit: {
        Args: { p_action: string; p_details?: string; p_target: string }
        Returns: undefined
      }
      mark_all_notifications_read: { Args: never; Returns: number }
      mark_item_complete: {
        Args: { p_complete?: boolean; p_item_id: string }
        Returns: Json
      }
      mark_payment_settled: {
        Args: { p_reference: string }
        Returns: undefined
      }
      notify_enrolled: {
        Args: {
          p_course_id: string
          p_link?: string
          p_message: string
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
        }
        Returns: undefined
      }
      owns_course: { Args: { target_course_id: string }; Returns: boolean }
      pass_is_releasable: { Args: { p_session_id: string }; Returns: boolean }
      promote_from_waitlist: { Args: { p_entry_id: string }; Returns: Json }
      redeem_entry_pass: {
        Args: { p_payload: string; p_session_id?: string }
        Returns: Json
      }
      review_application: {
        Args: { p_application_id: string; p_approve: boolean; p_note?: string }
        Returns: Json
      }
      safe_uuid: { Args: { p_text: string }; Returns: string }
      session_meeting_link: { Args: { p_session_id: string }; Returns: Json }
      start_attempt: { Args: { p_assessment_id: string }; Returns: Json }
      submit_attempt: {
        Args: { p_answers: Json; p_attempt_id: string }
        Returns: Json
      }
      sync_attendance: {
        Args: { p_device_id: string; p_records: Json }
        Returns: Json
      }
      sync_entry_passes: {
        Args: { p_course_id: string; p_student_id: string }
        Returns: undefined
      }
      teaches_course: { Args: { target_course_id: string }; Returns: boolean }
      verify_certificate: { Args: { p_credential_id: string }; Returns: Json }
      withdraw_application: { Args: { p_course_id: string }; Returns: Json }
    }
    Enums: {
      application_status: "pending" | "approved" | "rejected" | "withdrawn"
      assessment_kind: "prerequisite" | "checkpoint" | "final"
      assessment_status: "draft" | "published"
      attendance_method: "qr" | "manual"
      attendance_status: "present" | "absent" | "excused"
      course_status: "draft" | "published"
      difficulty: "easy" | "medium" | "hard"
      enrollment_status: "pending" | "active" | "completed" | "withdrawn"
      fee_type: "flat" | "tiered"
      module_item_type: "video" | "pdf" | "document" | "quiz"
      notification_type:
        | "course_update"
        | "new_class"
        | "transaction"
        | "system"
      pass_status: "active" | "used" | "past" | "revoked"
      payment_method: "card" | "transfer" | "ussd" | "cash"
      payment_purpose: "tuition" | "application_fee"
      payment_status: "pending" | "settled" | "failed" | "refunded"
      question_type: "single" | "multiple" | "boolean"
      sync_status: "synced" | "pending" | "failed"
      user_role: "student" | "instructor" | "admin"
      user_status: "active" | "suspended" | "pending"
      waitlist_status: "waiting" | "promoted" | "removed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: ["pending", "approved", "rejected", "withdrawn"],
      assessment_kind: ["prerequisite", "checkpoint", "final"],
      assessment_status: ["draft", "published"],
      attendance_method: ["qr", "manual"],
      attendance_status: ["present", "absent", "excused"],
      course_status: ["draft", "published"],
      difficulty: ["easy", "medium", "hard"],
      enrollment_status: ["pending", "active", "completed", "withdrawn"],
      fee_type: ["flat", "tiered"],
      module_item_type: ["video", "pdf", "document", "quiz"],
      notification_type: [
        "course_update",
        "new_class",
        "transaction",
        "system",
      ],
      pass_status: ["active", "used", "past", "revoked"],
      payment_method: ["card", "transfer", "ussd", "cash"],
      payment_purpose: ["tuition", "application_fee"],
      payment_status: ["pending", "settled", "failed", "refunded"],
      question_type: ["single", "multiple", "boolean"],
      sync_status: ["synced", "pending", "failed"],
      user_role: ["student", "instructor", "admin"],
      user_status: ["active", "suspended", "pending"],
      waitlist_status: ["waiting", "promoted", "removed"],
    },
  },
} as const
