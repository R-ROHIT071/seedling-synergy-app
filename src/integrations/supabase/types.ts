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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      group_buy_participants: {
        Row: {
          created_at: string
          group_buy_id: string
          id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          group_buy_id: string
          id?: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          group_buy_id?: string
          id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_buy_participants_group_buy_id_fkey"
            columns: ["group_buy_id"]
            isOneToOne: false
            referencedRelation: "group_buys"
            referencedColumns: ["id"]
          },
        ]
      }
      group_buys: {
        Row: {
          category: string
          created_at: string
          creator_id: string
          current_qty: number
          deadline: string
          description: string
          discount: number
          group_price: number
          id: string
          image: string | null
          location: string | null
          original_price: number
          specs: string | null
          target_qty: number
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          creator_id: string
          current_qty?: number
          deadline: string
          description?: string
          discount?: number
          group_price: number
          id?: string
          image?: string | null
          location?: string | null
          original_price: number
          specs?: string | null
          target_qty: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          creator_id?: string
          current_qty?: number
          deadline?: string
          description?: string
          discount?: number
          group_price?: number
          id?: string
          image?: string | null
          location?: string | null
          original_price?: number
          specs?: string | null
          target_qty?: number
          title?: string
        }
        Relationships: []
      }
      learning_resources: {
        Row: {
          category: string
          content: string
          created_at: string
          difficulty: string
          id: string
          language: string
          read_time: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category: string
          content?: string
          created_at?: string
          difficulty?: string
          id?: string
          language?: string
          read_time?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          difficulty?: string
          id?: string
          language?: string
          read_time?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          group_buy_notifications: boolean | null
          id: string
          order_notifications: boolean | null
          price_alerts: boolean | null
          system_notifications: boolean | null
          updated_at: string | null
          user_id: string
          verification_notifications: boolean | null
        }
        Insert: {
          created_at?: string | null
          group_buy_notifications?: boolean | null
          id?: string
          order_notifications?: boolean | null
          price_alerts?: boolean | null
          system_notifications?: boolean | null
          updated_at?: string | null
          user_id: string
          verification_notifications?: boolean | null
        }
        Update: {
          created_at?: string | null
          group_buy_notifications?: boolean | null
          id?: string
          order_notifications?: boolean | null
          price_alerts?: boolean | null
          system_notifications?: boolean | null
          updated_at?: string | null
          user_id?: string
          verification_notifications?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          delivery_date: string | null
          id: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          product_id: string
          quantity: number
          shipping_address: Json | null
          status: string
          total: number
          tracking_number: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_date?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_id: string
          quantity: number
          shipping_address?: Json | null
          status?: string
          total: number
          tracking_number?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_date?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_id?: string
          quantity?: number
          shipping_address?: Json | null
          status?: string
          total?: number
          tracking_number?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      price_predictions: {
        Row: {
          confidence: number
          created_at: string
          crop: string
          current_price: number
          id: string
          location: string
          predicted_price: number
        }
        Insert: {
          confidence: number
          created_at?: string
          crop: string
          current_price: number
          id?: string
          location: string
          predicted_price: number
        }
        Update: {
          confidence?: number
          created_at?: string
          crop?: string
          current_price?: number
          id?: string
          location?: string
          predicted_price?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          price: number
          stock: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          price: number
          stock?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          price?: number
          stock?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verifications: {
        Row: {
          created_at: string
          id: string
          status: string
          user_id: string
          verified_at: string | null
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          user_id: string
          verified_at?: string | null
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          user_id?: string
          verified_at?: string | null
          video_url?: string
        }
        Relationships: []
      }
      event_attendees: {
        Row: {
          created_at: string
          event_id: string
          id: string
          rsvp_status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          rsvp_status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          rsvp_status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "farmer_events"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_sharing: {
        Row: {
          availability: Json | null
          created_at: string
          daily_rate: number | null
          description: string
          equipment_type: string
          id: string
          image_url: string | null
          location: string | null
          owner_id: string
          title: string
        }
        Insert: {
          availability?: Json | null
          created_at?: string
          daily_rate?: number | null
          description: string
          equipment_type: string
          id?: string
          image_url?: string | null
          location?: string | null
          owner_id: string
          title: string
        }
        Update: {
          availability?: Json | null
          created_at?: string
          daily_rate?: number | null
          description?: string
          equipment_type?: string
          id?: string
          image_url?: string | null
          location?: string | null
          owner_id?: string
          title?: string
        }
        Relationships: []
      }
      farmer_events: {
        Row: {
          coordinates: Json | null
          created_at: string
          current_attendees: number
          description: string
          event_date: string
          event_type: string | null
          id: string
          is_free: boolean
          location: string
          max_attendees: number | null
          organizer_id: string
          title: string
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string
          current_attendees?: number
          description: string
          event_date: string
          event_type?: string | null
          id?: string
          is_free?: boolean
          location: string
          max_attendees?: number | null
          organizer_id: string
          title: string
        }
        Update: {
          coordinates?: Json | null
          created_at?: string
          current_attendees?: number
          description?: string
          event_date?: string
          event_type?: string | null
          id?: string
          is_free?: boolean
          location?: string
          max_attendees?: number | null
          organizer_id?: string
          title?: string
        }
        Relationships: []
      }
      forum_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          forum_id: string
          id: string
          image_url: string | null
          is_pinned: boolean
          likes_count: number
          replies_count: number
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          forum_id: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          likes_count?: number
          replies_count?: number
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          forum_id?: string
          id?: string
          image_url?: string | null
          is_pinned?: boolean
          likes_count?: number
          replies_count?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_forum_id_fkey"
            columns: ["forum_id"]
            isOneToOne: false
            referencedRelation: "forums"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          likes_count: number
          post_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          post_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forums: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          reply_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      success_stories: {
        Row: {
          author_id: string
          created_at: string
          crop_type: string | null
          id: string
          images: string[] | null
          is_featured: boolean
          likes_count: number
          location: string | null
          profit_increase: number | null
          story: string
          title: string
          views_count: number
          yield_increase: number | null
        }
        Insert: {
          author_id: string
          created_at?: string
          crop_type?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean
          likes_count?: number
          location?: string | null
          profit_increase?: number | null
          story: string
          title: string
          views_count?: number
          yield_increase?: number | null
        }
        Update: {
          author_id?: string
          created_at?: string
          crop_type?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean
          likes_count?: number
          location?: string | null
          profit_increase?: number | null
          story?: string
          title?: string
          views_count?: number
          yield_increase?: number | null
        }
        Relationships: []
      }
      weather_cache: {
        Row: {
          data: Json
          fetched_at: string
          id: string
          location: string
        }
        Insert: {
          data?: Json
          fetched_at?: string
          id?: string
          location: string
        }
        Update: {
          data?: Json
          fetched_at?: string
          id?: string
          location?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "farmer" | "vendor" | "admin"
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
    Enums: {
      app_role: ["farmer", "vendor", "admin"],
    },
  },
} as const
