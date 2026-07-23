// Generated from the live Supabase schema (project: plate-date, jvtrvfhufqkunmsxhand)
// via the Supabase MCP `generate_typescript_types` — regenerate after every migration.
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
      capacity: {
        Row: {
          date: string
          is_blackout: boolean
          max_orders: number
          note: string | null
        }
        Insert: {
          date: string
          is_blackout?: boolean
          max_orders?: number
          note?: string | null
        }
        Update: {
          date?: string
          is_blackout?: boolean
          max_orders?: number
          note?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      delivery_areas: {
        Row: {
          fee_paise: number
          id: string
          is_active: boolean
          name: string
        }
        Insert: {
          fee_paise?: number
          id?: string
          is_active?: boolean
          name: string
        }
        Update: {
          fee_paise?: number
          id?: string
          is_active?: boolean
          name?: string
        }
        Relationships: []
      }
      dietary_tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          budget_paise: number | null
          created_at: string
          event_date: string | null
          headcount: number | null
          id: string
          kind: Database["public"]["Enums"]["enquiry_kind"]
          message: string | null
          name: string
          phone: string
          status: Database["public"]["Enums"]["enquiry_status"]
        }
        Insert: {
          budget_paise?: number | null
          created_at?: string
          event_date?: string | null
          headcount?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["enquiry_kind"]
          message?: string | null
          name: string
          phone: string
          status?: Database["public"]["Enums"]["enquiry_status"]
        }
        Update: {
          budget_paise?: number | null
          created_at?: string
          event_date?: string | null
          headcount?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["enquiry_kind"]
          message?: string | null
          name?: string
          phone?: string
          status?: Database["public"]["Enums"]["enquiry_status"]
        }
        Relationships: []
      }
      festival_menu_items: {
        Row: {
          festival_id: string
          festival_price_paise: number | null
          menu_item_id: string
          sort_order: number
        }
        Insert: {
          festival_id: string
          festival_price_paise?: number | null
          menu_item_id: string
          sort_order?: number
        }
        Update: {
          festival_id?: string
          festival_price_paise?: number | null
          menu_item_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "festival_menu_items_festival_id_fkey"
            columns: ["festival_id"]
            isOneToOne: false
            referencedRelation: "festival_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "festival_menu_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      festival_menus: {
        Row: {
          ends_on: string
          hero_copy: string | null
          id: string
          is_published: boolean
          name: string
          slug: string
          starts_on: string
        }
        Insert: {
          ends_on: string
          hero_copy?: string | null
          id?: string
          is_published?: boolean
          name: string
          slug: string
          starts_on: string
        }
        Update: {
          ends_on?: string
          hero_copy?: string | null
          id?: string
          is_published?: boolean
          name?: string
          slug?: string
          starts_on?: string
        }
        Relationships: []
      }
      menu_item_dietary_tags: {
        Row: {
          dietary_tag_id: string
          menu_item_id: string
        }
        Insert: {
          dietary_tag_id: string
          menu_item_id: string
        }
        Update: {
          dietary_tag_id?: string
          menu_item_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_dietary_tags_dietary_tag_id_fkey"
            columns: ["dietary_tag_id"]
            isOneToOne: false
            referencedRelation: "dietary_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_dietary_tags_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_variants: {
        Row: {
          id: string
          label: string
          menu_item_id: string
          price_paise: number
          sort_order: number
        }
        Insert: {
          id?: string
          label: string
          menu_item_id: string
          price_paise: number
          sort_order?: number
        }
        Update: {
          id?: string
          label?: string
          menu_item_id?: string
          price_paise?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_variants_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category_id: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_hero: boolean
          lead_time_hours: number
          min_quantity: number
          name: string
          price_paise: number
          serves_count: number | null
          slug: string
          sort_order: number
        }
        Insert: {
          category_id: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_hero?: boolean
          lead_time_hours?: number
          min_quantity?: number
          name: string
          price_paise: number
          serves_count?: number | null
          slug: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_hero?: boolean
          lead_time_hours?: number
          min_quantity?: number
          name?: string
          price_paise?: number
          serves_count?: number | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          item_name: string
          line_note: string | null
          menu_item_id: string | null
          order_id: string
          quantity: number
          unit_price_paise: number
        }
        Insert: {
          id?: string
          item_name: string
          line_note?: string | null
          menu_item_id?: string | null
          order_id: string
          quantity?: number
          unit_price_paise: number
        }
        Update: {
          id?: string
          item_name?: string
          line_note?: string | null
          menu_item_id?: string | null
          order_id?: string
          quantity?: number
          unit_price_paise?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          area_id: string | null
          created_at: string
          customer_name: string
          delivery_date: string
          delivery_fee_paise: number
          delivery_slot: string | null
          email: string | null
          id: string
          notes: string | null
          order_number: string
          order_status: Database["public"]["Enums"]["order_status"]
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string
          reference_code: string
          subtotal_paise: number
          total_paise: number
        }
        Insert: {
          address: string
          area_id?: string | null
          created_at?: string
          customer_name: string
          delivery_date: string
          delivery_fee_paise?: number
          delivery_slot?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          order_number: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone: string
          reference_code: string
          subtotal_paise: number
          total_paise: number
        }
        Update: {
          address?: string
          area_id?: string | null
          created_at?: string
          customer_name?: string
          delivery_date?: string
          delivery_fee_paise?: number
          delivery_slot?: string | null
          email?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          order_status?: Database["public"]["Enums"]["order_status"]
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string
          reference_code?: string
          subtotal_paise?: number
          total_paise?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "delivery_areas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order: {
        Args: {
          p_address: string
          p_area_id: string
          p_customer_name: string
          p_delivery_date: string
          p_delivery_slot: string
          p_email: string
          p_items: Json
          p_notes: string
          p_payment_method: string
          p_phone: string
        }
        Returns: {
          order_id: string
          order_number: string
          reference_code: string
        }[]
      }
      get_date_availability: {
        Args: { p_from: string; p_to: string }
        Returns: {
          day: string
          is_blackout: boolean
          max_orders: number
          orders_booked: number
        }[]
      }
      get_order_by_reference: { Args: { p_reference: string }; Returns: Json }
    }
    Enums: {
      enquiry_kind: "party" | "bulk" | "custom"
      enquiry_status: "new" | "replied" | "converted" | "closed"
      order_status:
        | "new"
        | "confirmed"
        | "preparing"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      payment_method: "upi" | "cod"
      payment_status: "pending" | "paid" | "refunded"
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
      enquiry_kind: ["party", "bulk", "custom"],
      enquiry_status: ["new", "replied", "converted", "closed"],
      order_status: [
        "new",
        "confirmed",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_method: ["upi", "cod"],
      payment_status: ["pending", "paid", "refunded"],
    },
  },
} as const
