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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          last_login_at: string | null
          name: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          name?: string | null
          role?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          bg_color: string | null
          id: string
          is_active: boolean | null
          link: string | null
          text: string
          text_color: string | null
        }
        Insert: {
          bg_color?: string | null
          id?: string
          is_active?: boolean | null
          link?: string | null
          text: string
          text_color?: string | null
        }
        Update: {
          bg_color?: string | null
          id?: string
          is_active?: boolean | null
          link?: string | null
          text?: string
          text_color?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          cta_link: string | null
          cta_text: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          subtitle: string | null
          title: string | null
        }
        Insert: {
          cta_link?: string | null
          cta_text?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          subtitle?: string | null
          title?: string | null
        }
        Update: {
          cta_link?: string | null
          cta_text?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          subtitle?: string | null
          title?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          color: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          product_id: string | null
          quantity: number | null
          session_id: string | null
          size: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          session_id?: string | null
          size?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          session_id?: string | null
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          display_order: number | null
          gender: string
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          display_order?: number | null
          gender?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          display_order?: number | null
          gender?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          sender_email: string
          sender_name: string
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          sender_email: string
          sender_name: string
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          sender_email?: string
          sender_name?: string
          subject?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          default_address: Json | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          supabase_auth_id: string | null
        }
        Insert: {
          created_at?: string | null
          default_address?: Json | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          supabase_auth_id?: string | null
        }
        Update: {
          created_at?: string | null
          default_address?: Json | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          supabase_auth_id?: string | null
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order: number | null
          type: string | null
          used_count: number | null
          valid_until: string | null
          value: number | null
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order?: number | null
          type?: string | null
          used_count?: number | null
          valid_until?: string | null
          value?: number | null
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order?: number | null
          type?: string | null
          used_count?: number | null
          valid_until?: string | null
          value?: number | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          location: string | null
          requirements: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          location?: string | null
          requirements?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          location?: string | null
          requirements?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          id: string
          order_id: string | null
          price: number | null
          product_id: string | null
          product_image: string | null
          product_name: string | null
          quantity: number | null
          size: string | null
          subtotal: number | null
        }
        Insert: {
          color?: string | null
          id?: string
          order_id?: string | null
          price?: number | null
          product_id?: string | null
          product_image?: string | null
          product_name?: string | null
          quantity?: number | null
          size?: string | null
          subtotal?: number | null
        }
        Update: {
          color?: string | null
          id?: string
          order_id?: string | null
          price?: number | null
          product_id?: string | null
          product_image?: string | null
          product_name?: string | null
          quantity?: number | null
          size?: string | null
          subtotal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          confirmed_at: string | null
          courier_name: string | null
          created_at: string | null
          customer_email: string | null
          customer_id: string | null
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          discount_amount: number | null
          estimated_delivery: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_screenshot_url: string | null
          payment_tid: string | null
          payment_verified: boolean
          shipped_at: string | null
          shipping_address: Json | null
          shipping_charge: number | null
          status: string | null
          subtotal: number | null
          total: number | null
          tracking_number: string | null
        }
        Insert: {
          confirmed_at?: string | null
          courier_name?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_screenshot_url?: string | null
          payment_tid?: string | null
          payment_verified?: boolean
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_charge?: number | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          tracking_number?: string | null
        }
        Update: {
          confirmed_at?: string | null
          courier_name?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_screenshot_url?: string | null
          payment_tid?: string | null
          payment_verified?: boolean
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_charge?: number | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string
          id: string
          meta_description: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string
          id?: string
          meta_description?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          id?: string
          meta_description?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          color: string | null
          id: string
          is_available: boolean | null
          product_id: string | null
          size: string | null
          stock_quantity: number | null
        }
        Insert: {
          color?: string | null
          id?: string
          is_available?: boolean | null
          product_id?: string | null
          size?: string | null
          stock_quantity?: number | null
        }
        Update: {
          color?: string | null
          id?: string
          is_available?: boolean | null
          product_id?: string | null
          size?: string | null
          stock_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          care_instructions: string | null
          category_id: string | null
          colors: Json | null
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          is_bestseller: boolean | null
          is_featured: boolean | null
          is_new_arrival: boolean | null
          is_on_sale: boolean | null
          material: string | null
          name: string
          original_price: number | null
          price: number
          sizes: Json | null
          sku: string | null
          slug: string
          stock_status: string | null
          weight_grams: number | null
        }
        Insert: {
          care_instructions?: string | null
          category_id?: string | null
          colors?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          is_on_sale?: boolean | null
          material?: string | null
          name: string
          original_price?: number | null
          price?: number
          sizes?: Json | null
          sku?: string | null
          slug: string
          stock_status?: string | null
          weight_grams?: number | null
        }
        Update: {
          care_instructions?: string | null
          category_id?: string | null
          colors?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_bestseller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          is_on_sale?: boolean | null
          material?: string | null
          name?: string
          original_price?: number | null
          price?: number
          sizes?: Json | null
          sku?: string | null
          slug?: string
          stock_status?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      return_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          description: string | null
          id: string
          item_name: string | null
          order_id: string | null
          order_number: string | null
          reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          id?: string
          item_name?: string | null
          order_id?: string | null
          order_number?: string | null
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          id?: string
          item_name?: string | null
          order_id?: string | null
          order_number?: string | null
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string
          id: string
          is_approved: boolean | null
          is_verified: boolean | null
          is_verified_buyer: boolean
          photo_url: string | null
          product_id: string | null
          rating: number
          title: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name: string
          id?: string
          is_approved?: boolean | null
          is_verified?: boolean | null
          is_verified_buyer?: boolean
          photo_url?: string | null
          product_id?: string | null
          rating: number
          title?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string
          id?: string
          is_approved?: boolean | null
          is_verified?: boolean | null
          is_verified_buyer?: boolean
          photo_url?: string | null
          product_id?: string | null
          rating?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          charge: number | null
          est_days: string | null
          free_above: number | null
          id: string
          province: string
        }
        Insert: {
          charge?: number | null
          est_days?: string | null
          free_above?: number | null
          id?: string
          province: string
        }
        Update: {
          charge?: number | null
          est_days?: string | null
          free_above?: number | null
          id?: string
          province?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          product_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      track_order: {
        Args: { p_order_number: string; p_phone: string }
        Returns: {
          confirmed_at: string
          courier_name: string
          created_at: string
          customer_name: string
          delivered_at: string
          delivered_at_2: string
          discount_amount: number
          estimated_delivery: string
          items: Json
          order_number: string
          payment_method: string
          payment_verified: boolean
          shipped_at: string
          shipping_address: Json
          shipping_charge: number
          status: string
          subtotal: number
          total: number
          tracking_number: string
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
