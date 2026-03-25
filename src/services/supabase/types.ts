export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      life_phases: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          starts_on: string | null;
          ends_on: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          starts_on?: string | null;
          ends_on?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          starts_on?: string | null;
          ends_on?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      drawers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string | null;
          icon: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      entries: {
        Row: {
          id: string;
          user_id: string;
          life_phase_id: string | null;
          title: string;
          content: string | null;
          mood: string | null;
          images: Json | null;
          audio_url: string | null;
          location: Json | null;
          occurred_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          life_phase_id?: string | null;
          title: string;
          content?: string | null;
          mood?: string | null;
          images?: Json | null;
          audio_url?: string | null;
          location?: Json | null;
          occurred_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          life_phase_id?: string | null;
          title?: string;
          content?: string | null;
          mood?: string | null;
          images?: Json | null;
          audio_url?: string | null;
          location?: Json | null;
          occurred_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      entry_drawers: {
        Row: {
          user_id: string;
          entry_id: string;
          drawer_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          entry_id: string;
          drawer_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          entry_id?: string;
          drawer_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      entry_tags: {
        Row: {
          user_id: string;
          entry_id: string;
          tag_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          entry_id: string;
          tag_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          entry_id?: string;
          tag_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
