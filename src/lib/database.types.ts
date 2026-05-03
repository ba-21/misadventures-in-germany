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
  public: {
    Tables: {
      popular_posts: {
        Row: {
          blurb: string
          created_at: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          blurb: string
          created_at?: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          blurb?: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          body: string
          cover_image_alt: string
          cover_image_url: string
          created_at: string
          day_label: string
          highlight: string
          id: string
          location: string
          published_at: string | null
          slug: string
          sort_order: number
          status: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          cover_image_alt: string
          cover_image_url: string
          created_at?: string
          day_label: string
          highlight: string
          id?: string
          location: string
          published_at?: string | null
          slug: string
          sort_order?: number
          status?: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          cover_image_alt?: string
          cover_image_url?: string
          created_at?: string
          day_label?: string
          highlight?: string
          id?: string
          location?: string
          published_at?: string | null
          slug?: string
          sort_order?: number
          status?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      recent_posts: {
        Row: {
          blurb: string
          created_at: string
          id: string
          sort_order: number
          title: string
        }
        Insert: {
          blurb: string
          created_at?: string
          id?: string
          sort_order?: number
          title: string
        }
        Update: {
          blurb?: string
          created_at?: string
          id?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_badges: string
          about_blog_section_body: string
          about_blog_section_title: string
          about_contact_body: string
          about_contact_title: string
          about_hero_title: string
          about_story_body: string
          about_travel_pattern_stat_1_text: string
          about_travel_pattern_stat_1_value: string
          about_travel_pattern_stat_2_text: string
          about_travel_pattern_stat_2_value: string
          about_travel_pattern_stat_3_text: string
          about_travel_pattern_stat_3_value: string
          about_travel_pattern_title: string
          about_travel_style_body: string
          about_travel_style_title: string
          author_bio: string
          author_initials: string
          author_name: string
          contact_background_image_url: string
          contact_email: string
          contact_form_intro: string
          contact_form_title: string
          contact_hero_body: string
          contact_hero_eyebrow: string
          contact_hero_title: string
          contact_sidebar_body: string
          contact_sidebar_title: string
          contact_tips: string
          hero_eyebrow: string
          hero_subtitle: string
          hero_title: string
          instagram_url: string
          singleton: boolean
          updated_at: string
          youtube_url: string
        }
        Insert: {
          about_badges?: string
          about_blog_section_body?: string
          about_blog_section_title?: string
          about_contact_body?: string
          about_contact_title?: string
          about_hero_title?: string
          about_story_body?: string
          about_travel_pattern_stat_1_text?: string
          about_travel_pattern_stat_1_value?: string
          about_travel_pattern_stat_2_text?: string
          about_travel_pattern_stat_2_value?: string
          about_travel_pattern_stat_3_text?: string
          about_travel_pattern_stat_3_value?: string
          about_travel_pattern_title?: string
          about_travel_style_body?: string
          about_travel_style_title?: string
          author_bio: string
          author_initials: string
          author_name: string
          contact_background_image_url?: string
          contact_email: string
          contact_form_intro?: string
          contact_form_title?: string
          contact_hero_body?: string
          contact_hero_eyebrow?: string
          contact_hero_title?: string
          contact_sidebar_body?: string
          contact_sidebar_title?: string
          contact_tips?: string
          hero_eyebrow: string
          hero_subtitle: string
          hero_title: string
          instagram_url: string
          singleton?: boolean
          updated_at?: string
          youtube_url: string
        }
        Update: {
          about_badges?: string
          about_blog_section_body?: string
          about_blog_section_title?: string
          about_contact_body?: string
          about_contact_title?: string
          about_hero_title?: string
          about_story_body?: string
          about_travel_pattern_stat_1_text?: string
          about_travel_pattern_stat_1_value?: string
          about_travel_pattern_stat_2_text?: string
          about_travel_pattern_stat_2_value?: string
          about_travel_pattern_stat_3_text?: string
          about_travel_pattern_stat_3_value?: string
          about_travel_pattern_title?: string
          about_travel_style_body?: string
          about_travel_style_title?: string
          author_bio?: string
          author_initials?: string
          author_name?: string
          contact_background_image_url?: string
          contact_email?: string
          contact_form_intro?: string
          contact_form_title?: string
          contact_hero_body?: string
          contact_hero_eyebrow?: string
          contact_hero_title?: string
          contact_sidebar_body?: string
          contact_sidebar_title?: string
          contact_tips?: string
          hero_eyebrow?: string
          hero_subtitle?: string
          hero_title?: string
          instagram_url?: string
          singleton?: boolean
          updated_at?: string
          youtube_url?: string
        }
        Relationships: []
      }
      travel_tips: {
        Row: {
          content: string
          created_at: string
          id: string
          sort_order: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sort_order?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
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
