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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      application_tracking: {
        Row: {
          created_at: string
          id: string
          notes: string
          remind: boolean
          scholarship_id: string
          status: Database["public"]["Enums"]["tracking_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string
          remind?: boolean
          scholarship_id: string
          status?: Database["public"]["Enums"]["tracking_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string
          remind?: boolean
          scholarship_id?: string
          status?: Database["public"]["Enums"]["tracking_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_tracking_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string
          created_at: string
          currency: string
          flag: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          currency?: string
          flag?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          flag?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      education_levels: {
        Row: {
          code: string
          description: string
          name: string
          sort_order: number
        }
        Insert: {
          code: string
          description?: string
          name: string
          sort_order?: number
        }
        Update: {
          code?: string
          description?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          dedupe_key: string | null
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          dedupe_key?: string | null
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          dedupe_key?: string | null
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country_code: string | null
          created_at: string
          display_name: string | null
          education_level: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          display_name?: string | null
          education_level?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          display_name?: string | null
          education_level?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "profiles_education_level_fkey"
            columns: ["education_level"]
            isOneToOne: false
            referencedRelation: "education_levels"
            referencedColumns: ["code"]
          },
        ]
      }
      saved_scholarships: {
        Row: {
          created_at: string
          scholarship_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          scholarship_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          scholarship_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_scholarships_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_revisions: {
        Row: {
          changed_by: string | null
          changed_fields: string[]
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["scholarship_status"] | null
          old_status: Database["public"]["Enums"]["scholarship_status"] | null
          scholarship_id: string
          snapshot: Json
        }
        Insert: {
          changed_by?: string | null
          changed_fields?: string[]
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["scholarship_status"] | null
          old_status?: Database["public"]["Enums"]["scholarship_status"] | null
          scholarship_id: string
          snapshot: Json
        }
        Update: {
          changed_by?: string | null
          changed_fields?: string[]
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["scholarship_status"] | null
          old_status?: Database["public"]["Enums"]["scholarship_status"] | null
          scholarship_id?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_revisions_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          ai_confidence: Json
          ai_flags: Json
          application_steps: string[]
          award_amount: string
          benefits: string
          category: string
          closes_on: string | null
          contact_email: string | null
          contact_info: string
          contact_phone: string | null
          country_code: string
          created_at: string
          created_by: string
          education_levels: string[]
          eligibility: string
          eligibility_tags: string[]
          entry_method: string
          first_approver_id: string | null
          id: string
          name: string
          official_url: string | null
          opens_on: string | null
          provider: string
          provider_type: Database["public"]["Enums"]["provider_type"]
          published_at: string | null
          required_documents: string[]
          reviewer_notes: string
          sensitive_pending: boolean
          slug: string
          source_url: string | null
          status: Database["public"]["Enums"]["scholarship_status"]
          summary: string
          updated_at: string
          updated_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          ai_confidence?: Json
          ai_flags?: Json
          application_steps?: string[]
          award_amount?: string
          benefits?: string
          category?: string
          closes_on?: string | null
          contact_email?: string | null
          contact_info?: string
          contact_phone?: string | null
          country_code: string
          created_at?: string
          created_by: string
          education_levels?: string[]
          eligibility?: string
          eligibility_tags?: string[]
          entry_method?: string
          first_approver_id?: string | null
          id?: string
          name: string
          official_url?: string | null
          opens_on?: string | null
          provider: string
          provider_type: Database["public"]["Enums"]["provider_type"]
          published_at?: string | null
          required_documents?: string[]
          reviewer_notes?: string
          sensitive_pending?: boolean
          slug: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["scholarship_status"]
          summary?: string
          updated_at?: string
          updated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          ai_confidence?: Json
          ai_flags?: Json
          application_steps?: string[]
          award_amount?: string
          benefits?: string
          category?: string
          closes_on?: string | null
          contact_email?: string | null
          contact_info?: string
          contact_phone?: string | null
          country_code?: string
          created_at?: string
          created_by?: string
          education_levels?: string[]
          eligibility?: string
          eligibility_tags?: string[]
          entry_method?: string
          first_approver_id?: string | null
          id?: string
          name?: string
          official_url?: string | null
          opens_on?: string | null
          provider?: string
          provider_type?: Database["public"]["Enums"]["provider_type"]
          published_at?: string | null
          required_documents?: string[]
          reviewer_notes?: string
          sensitive_pending?: boolean
          slug?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["scholarship_status"]
          summary?: string
          updated_at?: string
          updated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarships_country_code_fkey"
            columns: ["country_code"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["code"]
          },
        ]
      }
      uploaded_documents: {
        Row: {
          created_at: string
          file_name: string
          id: string
          mime_type: string
          purpose: string
          scholarship_id: string | null
          size_bytes: number
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          mime_type: string
          purpose?: string
          scholarship_id?: string | null
          size_bytes: number
          storage_path: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string
          purpose?: string
          scholarship_id?: string | null
          size_bytes?: number
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_documents_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_records: {
        Row: {
          checklist: Json
          created_at: string
          decision: string
          id: string
          notes: string
          reviewer_id: string
          scholarship_id: string
          source_urls: string[]
        }
        Insert: {
          checklist?: Json
          created_at?: string
          decision: string
          id?: string
          notes?: string
          reviewer_id: string
          scholarship_id: string
          source_urls?: string[]
        }
        Update: {
          checklist?: Json
          created_at?: string
          decision?: string
          id?: string
          notes?: string
          reviewer_id?: string
          scholarship_id?: string
          source_urls?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "verification_records_scholarship_id_fkey"
            columns: ["scholarship_id"]
            isOneToOne: false
            referencedRelation: "scholarships"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_my_deadline_reminders: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      run_expiry_check: { Args: never; Returns: number }
      system_deadline_check: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "super_admin" | "editor" | "verifier" | "publisher"
      provider_type: "government" | "private"
      scholarship_status:
        | "draft"
        | "pending_verification"
        | "changes_requested"
        | "rejected"
        | "approved"
        | "published"
        | "expired"
        | "archived"
      tracking_status: "interested" | "applied" | "completed"
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
  public: {
    Enums: {
      app_role: ["super_admin", "editor", "verifier", "publisher"],
      provider_type: ["government", "private"],
      scholarship_status: [
        "draft",
        "pending_verification",
        "changes_requested",
        "rejected",
        "approved",
        "published",
        "expired",
        "archived",
      ],
      tracking_status: ["interested", "applied", "completed"],
    },
  },
} as const
