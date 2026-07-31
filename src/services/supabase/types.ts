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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      drawers: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          resurfacing_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          resurfacing_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          resurfacing_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drawers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entries: {
        Row: {
          audio_url: string | null
          content: string
          created_at: string
          id: string
          images: string[] | null
          life_phase_id: string | null
          location: Json | null
          mood: string | null
          occurred_at: string | null
          parent_entry_id: string | null
          reflection_type: string | null
          last_viewed_at: string | null
          last_resurfaced_at: string | null
          revisit_count: number
          resurface_count: number
          return_dismissed_until: string | null
          saved_for_later: boolean
          resurfacing_enabled: boolean
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          content: string
          created_at?: string
          id?: string
          images?: string[] | null
          life_phase_id?: string | null
          location?: Json | null
          mood?: string | null
          occurred_at?: string | null
          parent_entry_id?: string | null
          reflection_type?: string | null
          last_viewed_at?: string | null
          last_resurfaced_at?: string | null
          revisit_count?: number
          resurface_count?: number
          return_dismissed_until?: string | null
          saved_for_later?: boolean
          resurfacing_enabled?: boolean
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          content?: string
          created_at?: string
          id?: string
          images?: string[] | null
          life_phase_id?: string | null
          location?: Json | null
          mood?: string | null
          occurred_at?: string | null
          parent_entry_id?: string | null
          reflection_type?: string | null
          last_viewed_at?: string | null
          last_resurfaced_at?: string | null
          revisit_count?: number
          resurface_count?: number
          return_dismissed_until?: string | null
          saved_for_later?: boolean
          resurfacing_enabled?: boolean
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entries_parent_entry_user_fk"
            columns: ["parent_entry_id", "user_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "entries_life_phase_id_fkey"
            columns: ["life_phase_id"]
            isOneToOne: false
            referencedRelation: "life_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_drawers: {
        Row: {
          created_at: string
          drawer_id: string
          entry_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          drawer_id: string
          entry_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          drawer_id?: string
          entry_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_drawers_drawer_id_fkey"
            columns: ["drawer_id"]
            isOneToOne: false
            referencedRelation: "drawers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_drawers_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_drawers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entry_tags: {
        Row: {
          created_at: string
          entry_id: string
          id: string
          tag_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          id?: string
          tag_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: string
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_tags_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entry_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      life_phases: {
        Row: {
          created_at: string
          description: string | null
          ends_on: string | null
          id: string
          is_active: boolean
          name: string
          starts_on: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_on?: string | null
          id?: string
          is_active?: boolean
          name: string
          starts_on?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_on?: string | null
          id?: string
          is_active?: boolean
          name?: string
          starts_on?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          insights_return_content_enabled: boolean
          return_features_enabled: boolean
          return_notification_frequency: string
          show_on_this_day: boolean
          show_return_content_on_home: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          insights_return_content_enabled?: boolean
          return_features_enabled?: boolean
          return_notification_frequency?: string
          show_on_this_day?: boolean
          show_return_content_on_home?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          insights_return_content_enabled?: boolean
          return_features_enabled?: boolean
          return_notification_frequency?: string
          show_on_this_day?: boolean
          show_return_content_on_home?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_entry_view: {
        Args: {
          p_entry_id: string
        }
        Returns: {
          last_viewed_at: string
          revisit_count: number
        }[]
      }
      record_home_return_display: {
        Args: {
          p_entry_id: string
        }
        Returns: {
          last_resurfaced_at: string
          resurface_count: number
        }[]
      }
      get_drawer_return_overview: {
        Args: {
          p_drawer_id: string
        }
        Returns: {
          entry_count: number
          first_entry_at: string | null
          latest_entry_at: string | null
          saved_for_later_count: number
          connected_reflection_count: number
          revisited_count: number
        }[]
      }
      get_drawer_filtered_entry_ids: {
        Args: {
          p_drawer_id: string
          p_filter?: string
          p_sort?: string
          p_tag_id?: string | null
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          entry_id: string
          total_count: number
        }[]
      }
      get_drawer_common_tags: {
        Args: {
          p_drawer_id: string
          p_limit?: number
        }
        Returns: {
          tag_id: string
          tag_name: string
          tag_color: string | null
          entry_count: number
        }[]
      }
      get_insights_collection_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          entry_count: number
          drawer_count: number
          first_entry_at: string | null
          latest_entry_at: string | null
          saved_for_later_count: number
          connected_reflection_count: number
          tag_count: number
        }[]
      }
      get_insights_reflection_chains: {
        Args: {
          p_limit?: number
        }
        Returns: {
          root_entry_id: string
          original_entry_at: string
          latest_reflection_at: string
          entry_count: number
          title: string | null
          preview: string
          chain_count: number
          connected_entry_count: number
        }[]
      }
      get_insights_drawer_summaries: {
        Args: {
          p_limit?: number
        }
        Returns: {
          drawer_id: string
          drawer_name: string
          drawer_color: string | null
          drawer_icon: string | null
          entry_count: number
          first_entry_at: string | null
          latest_entry_at: string | null
          saved_for_later_count: number
          connected_reflection_count: number
          common_tags: string[]
        }[]
      }
      get_insights_recurring_themes: {
        Args: {
          p_start_at?: string | null
          p_limit?: number
        }
        Returns: {
          tag_id: string
          tag_name: string
          tag_color: string | null
          entry_count: number
          drawer_count: number
          first_entry_at: string
          latest_entry_at: string
          connected_reflection_count: number
          drawer_ids: string[]
          drawer_names: string[]
          year_counts: string[]
        }[]
      }
      get_insights_reflection_comparisons: {
        Args: {
          p_start_at?: string | null
          p_limit?: number
        }
        Returns: {
          root_entry_id: string
          original_entry_at: string
          original_preview: string
          latest_entry_id: string
          latest_reflection_at: string
          latest_preview: string
          latest_reflection_type: string | null
          entry_count: number
        }[]
      }
      get_insights_recently_returned: {
        Args: {
          p_start_at?: string | null
          p_limit?: number
        }
        Returns: {
          entry_id: string
          title: string | null
          preview: string
          created_at: string
          last_viewed_at: string
          drawer_name: string | null
          has_connected_reflection: boolean
        }[]
      }
      get_insights_saved_for_later_summary: {
        Args: {
          p_start_at?: string | null
        }
        Returns: {
          entry_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
