/**
 * Database types.
 *
 * Hand-written to match supabase/migrations. Once the project is linked you can
 * replace this file wholesale with:
 *
 *   npm run types:gen
 *
 * Keep the shape identical when you do — the app imports `Database`, `Tables`
 * and `Enums` from here and nothing else.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = { created_at: string };

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    name: string;
                    email: string;
                    role: Enums<"user_role">;
                    status: Enums<"user_status">;
                    avatar_url: string | null;
                    phone: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; name: string; email: string };
                Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
                Relationships: [];
            };
            venues: {
                Row: { id: string; name: string; capacity: number } & Timestamps;
                Insert: { id?: string; name: string; capacity: number };
                Update: Partial<{ name: string; capacity: number }>;
                Relationships: [];
            };
            courses: {
                Row: {
                    id: string;
                    title: string;
                    description: string;
                    duration: string;
                    location: string;
                    category: string;
                    seats_total: number;
                    fee_type: Enums<"fee_type">;
                    fee_amount: number | null;
                    application_fee: number;
                    status: Enums<"course_status">;
                    instructor_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Partial<Database["public"]["Tables"]["courses"]["Row"]> & { title: string; category: string };
                Update: Partial<Database["public"]["Tables"]["courses"]["Row"]>;
                Relationships: [];
            };
            course_fee_tiers: {
                Row: { id: string; course_id: string; name: string; amount: number; position: number };
                Insert: { id?: string; course_id: string; name: string; amount: number; position?: number };
                Update: Partial<{ name: string; amount: number; position: number }>;
                Relationships: [];
            };
            course_modules: {
                Row: { id: string; course_id: string; title: string; position: number } & Timestamps;
                Insert: { id?: string; course_id: string; title: string; position?: number };
                Update: Partial<{ title: string; position: number }>;
                Relationships: [];
            };
            module_items: {
                Row: {
                    id: string;
                    module_id: string;
                    title: string;
                    type: Enums<"module_item_type">;
                    storage_path: string | null;
                    external_url: string | null;
                    assessment_id: string | null;
                    position: number;
                } & Timestamps;
                Insert: Partial<Database["public"]["Tables"]["module_items"]["Row"]> & {
                    module_id: string; title: string; type: Enums<"module_item_type">;
                };
                Update: Partial<Database["public"]["Tables"]["module_items"]["Row"]>;
                Relationships: [];
            };
            assessments: {
                Row: {
                    id: string;
                    course_id: string;
                    module_id: string | null;
                    title: string;
                    description: string;
                    kind: Enums<"assessment_kind">;
                    status: Enums<"assessment_status">;
                    passing_score: number;
                    time_limit_minutes: number;
                    max_attempts: number;
                    gates_entry_pass: boolean;
                    created_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: Partial<Database["public"]["Tables"]["assessments"]["Row"]> & { course_id: string; title: string };
                Update: Partial<Database["public"]["Tables"]["assessments"]["Row"]>;
                Relationships: [];
            };
            assessment_questions: {
                Row: {
                    id: string;
                    assessment_id: string;
                    prompt: string;
                    type: Enums<"question_type">;
                    explanation: string | null;
                    difficulty: Enums<"difficulty">;
                    points: number;
                    tags: string[];
                    remedial_module_id: string | null;
                    position: number;
                } & Timestamps;
                Insert: Partial<Database["public"]["Tables"]["assessment_questions"]["Row"]> & {
                    assessment_id: string; prompt: string;
                };
                Update: Partial<Database["public"]["Tables"]["assessment_questions"]["Row"]>;
                Relationships: [];
            };
            /** `is_correct` is revoked from `authenticated`; reads of it come from RPCs. */
            question_options: {
                Row: { id: string; question_id: string; label: string; position: number };
                Insert: { id?: string; question_id: string; label: string; is_correct?: boolean; position?: number };
                Update: Partial<{ label: string; is_correct: boolean; position: number }>;
                Relationships: [];
            };
            assessment_attempts: {
                Row: {
                    id: string;
                    assessment_id: string;
                    course_id: string;
                    student_id: string;
                    attempt_number: number;
                    score: number | null;
                    points_earned: number | null;
                    points_possible: number | null;
                    passed: boolean | null;
                    started_at: string;
                    submitted_at: string | null;
                    duration_seconds: number | null;
                };
                Insert: never;
                Update: never;
                Relationships: [];
            };
            attempt_answers: {
                Row: {
                    id: string;
                    attempt_id: string;
                    question_id: string;
                    selected_option_ids: string[];
                    correct: boolean | null;
                    points_earned: number | null;
                };
                Insert: never;
                Update: never;
                Relationships: [];
            };
            enrollments: {
                Row: {
                    id: string;
                    course_id: string;
                    student_id: string;
                    status: Enums<"enrollment_status">;
                    progress: number;
                    last_item_id: string | null;
                    enrolled_at: string;
                    completed_at: string | null;
                };
                Insert: Partial<Database["public"]["Tables"]["enrollments"]["Row"]> & { course_id: string; student_id: string };
                Update: Partial<Database["public"]["Tables"]["enrollments"]["Row"]>;
                Relationships: [];
            };
            lesson_progress: {
                Row: { id: string; enrollment_id: string; module_item_id: string; completed_at: string };
                Insert: never;
                Update: never;
                Relationships: [];
            };
            waitlist_entries: {
                Row: {
                    id: string;
                    course_id: string;
                    student_id: string;
                    position: number;
                    status: Enums<"waitlist_status">;
                    requested_at: string;
                };
                Insert: Partial<Database["public"]["Tables"]["waitlist_entries"]["Row"]> & { course_id: string; student_id: string; position: number };
                Update: Partial<Database["public"]["Tables"]["waitlist_entries"]["Row"]>;
                Relationships: [];
            };
            payments: {
                Row: {
                    id: string;
                    reference: string;
                    student_id: string;
                    course_id: string | null;
                    enrollment_id: string | null;
                    purpose: Enums<"payment_purpose">;
                    amount: number;
                    currency: string;
                    method: Enums<"payment_method">;
                    status: Enums<"payment_status">;
                    provider_ref: string | null;
                    created_at: string;
                    settled_at: string | null;
                };
                Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & { reference: string; student_id: string; amount: number };
                Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
                Relationships: [];
            };
            course_sessions: {
                Row: {
                    id: string;
                    course_id: string;
                    title: string;
                    session_date: string;
                    starts_at: string;
                    ends_at: string;
                    venue_id: string | null;
                    venue_name: string;
                    room_number: string;
                    capacity: number | null;
                    instructor_id: string | null;
                } & Timestamps;
                Insert: Partial<Database["public"]["Tables"]["course_sessions"]["Row"]> & {
                    course_id: string; title: string; session_date: string; starts_at: string; ends_at: string;
                };
                Update: Partial<Database["public"]["Tables"]["course_sessions"]["Row"]>;
                Relationships: [];
            };
            entry_passes: {
                Row: {
                    id: string;
                    session_id: string;
                    student_id: string;
                    pass_code: string;
                    status: Enums<"pass_status">;
                    issued_at: string;
                    used_at: string | null;
                    used_by: string | null;
                };
                Insert: never;
                Update: never;
                Relationships: [];
            };
            attendance_records: {
                Row: {
                    id: string;
                    session_id: string;
                    student_id: string;
                    status: Enums<"attendance_status">;
                    method: Enums<"attendance_method">;
                    check_in_time: string | null;
                    marked_by: string | null;
                    client_record_id: string | null;
                    device_id: string | null;
                    updated_at: string;
                };
                Insert: Partial<Database["public"]["Tables"]["attendance_records"]["Row"]> & { session_id: string; student_id: string };
                Update: Partial<Database["public"]["Tables"]["attendance_records"]["Row"]>;
                Relationships: [];
            };
            subjective_grades: {
                Row: {
                    id: string;
                    session_id: string;
                    student_id: string;
                    score: number;
                    notes: string | null;
                    graded_by: string | null;
                } & Timestamps;
                Insert: Partial<Database["public"]["Tables"]["subjective_grades"]["Row"]> & {
                    session_id: string; student_id: string; score: number;
                };
                Update: Partial<Database["public"]["Tables"]["subjective_grades"]["Row"]>;
                Relationships: [];
            };
            certificates: {
                Row: {
                    id: string;
                    student_id: string;
                    course_id: string;
                    credential_id: string;
                    issued_at: string;
                    storage_path: string | null;
                    revoked_at: string | null;
                };
                Insert: Partial<Database["public"]["Tables"]["certificates"]["Row"]> & {
                    student_id: string; course_id: string; credential_id: string;
                };
                Update: Partial<Database["public"]["Tables"]["certificates"]["Row"]>;
                Relationships: [];
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    type: Enums<"notification_type">;
                    title: string;
                    message: string;
                    link: string | null;
                    is_read: boolean;
                    created_at: string;
                };
                Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & { user_id: string; title: string };
                Update: Partial<{ is_read: boolean }>;
                Relationships: [];
            };
            audit_logs: {
                Row: {
                    id: string;
                    actor_id: string | null;
                    actor_name: string;
                    actor_role: Enums<"user_role"> | null;
                    action: string;
                    target: string;
                    details: string;
                    created_at: string;
                };
                Insert: never;
                Update: never;
                Relationships: [];
            };
            device_sync_logs: {
                Row: {
                    id: string;
                    instructor_id: string | null;
                    device_id: string;
                    record_count: number;
                    status: Enums<"sync_status">;
                    error_detail: string | null;
                    synced_at: string;
                };
                Insert: never;
                Update: never;
                Relationships: [];
            };
        };
        Views: {
            course_seat_counts: {
                Row: { course_id: string; seats_total: number; seats_taken: number };
                Relationships: [];
            };
        };
        Functions: {
            start_attempt: { Args: { p_assessment_id: string }; Returns: Json };
            submit_attempt: { Args: { p_attempt_id: string; p_answers: Json }; Returns: Json };
            attempt_result: { Args: { p_attempt_id: string }; Returns: Json };
            assessment_authoring_payload: { Args: { p_assessment_id: string }; Returns: Json };
            enroll_in_course: { Args: { p_course_id: string }; Returns: Json };
            join_waitlist: { Args: { p_course_id: string }; Returns: Json };
            checkout_course: { Args: { p_course_id: string; p_method?: Enums<"payment_method"> }; Returns: Json };
            mark_item_complete: { Args: { p_item_id: string; p_complete?: boolean }; Returns: Json };
            entry_pass_qr: { Args: { p_pass_id: string }; Returns: Json };
            entry_pass_unlocked: { Args: { p_course_id: string; p_student_id: string }; Returns: boolean };
            blocking_assessment: { Args: { p_course_id: string; p_student_id: string }; Returns: string | null };
            redeem_entry_pass: { Args: { p_payload: string; p_session_id?: string }; Returns: Json };
            sync_attendance: { Args: { p_device_id: string; p_records: Json }; Returns: Json };
            promote_from_waitlist: { Args: { p_entry_id: string }; Returns: Json };
            verify_certificate: { Args: { p_credential_id: string }; Returns: Json };
            log_audit: { Args: { p_action: string; p_target: string; p_details?: string }; Returns: undefined };
        };
        Enums: {
            user_role: "student" | "instructor" | "admin";
            user_status: "active" | "suspended" | "pending";
            course_status: "draft" | "published";
            fee_type: "flat" | "tiered";
            module_item_type: "video" | "pdf" | "document" | "quiz";
            assessment_kind: "prerequisite" | "checkpoint" | "final";
            assessment_status: "draft" | "published";
            question_type: "single" | "multiple" | "boolean";
            difficulty: "easy" | "medium" | "hard";
            enrollment_status: "pending" | "active" | "completed" | "withdrawn";
            waitlist_status: "waiting" | "promoted" | "removed";
            payment_status: "pending" | "settled" | "failed" | "refunded";
            payment_method: "card" | "transfer" | "ussd" | "cash";
            payment_purpose: "tuition" | "application_fee";
            pass_status: "active" | "used" | "past" | "revoked";
            attendance_status: "present" | "absent" | "excused";
            attendance_method: "qr" | "manual";
            notification_type: "course_update" | "new_class" | "transaction" | "system";
            sync_status: "synced" | "pending" | "failed";
        };
        CompositeTypes: Record<string, never>;
    };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
    Database["public"]["Tables"][T]["Row"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
    Database["public"]["Enums"][T];

export type Views<T extends keyof Database["public"]["Views"]> =
    Database["public"]["Views"][T]["Row"];
