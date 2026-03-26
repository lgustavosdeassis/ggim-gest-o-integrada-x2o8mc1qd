// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      activities: {
        Row: {
          action_end: string | null
          action_start: string | null
          actions: Json | null
          additional_days: Json | null
          created_at: string | null
          deliberations: string | null
          description: string | null
          documents: Json | null
          event_name: string | null
          event_type: string
          has_action: boolean | null
          has_additional_days: boolean | null
          id: string
          instance: string
          location: string
          meeting_end: string
          meeting_start: string
          modality: string
          participants_pf: string | null
          participants_pj: string | null
        }
        Insert: {
          action_end?: string | null
          action_start?: string | null
          actions?: Json | null
          additional_days?: Json | null
          created_at?: string | null
          deliberations?: string | null
          description?: string | null
          documents?: Json | null
          event_name?: string | null
          event_type: string
          has_action?: boolean | null
          has_additional_days?: boolean | null
          id?: string
          instance: string
          location: string
          meeting_end: string
          meeting_start: string
          modality: string
          participants_pf?: string | null
          participants_pj?: string | null
        }
        Update: {
          action_end?: string | null
          action_start?: string | null
          actions?: Json | null
          additional_days?: Json | null
          created_at?: string | null
          deliberations?: string | null
          description?: string | null
          documents?: Json | null
          event_name?: string | null
          event_type?: string
          has_action?: boolean | null
          has_additional_days?: boolean | null
          id?: string
          instance?: string
          location?: string
          meeting_end?: string
          meeting_start?: string
          modality?: string
          participants_pf?: string | null
          participants_pj?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          id: string
          timestamp: string | null
          user_email: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          id?: string
          timestamp?: string | null
          user_email?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          id?: string
          timestamp?: string | null
          user_email?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      obs_records: {
        Row: {
          autos_infracao: number | null
          created_at: string | null
          date: string
          homicidios: number | null
          id: string
          roubos: number | null
          sinistros_total: number | null
          sinistros_vitimas: number | null
          violencia_domestica: number | null
        }
        Insert: {
          autos_infracao?: number | null
          created_at?: string | null
          date: string
          homicidios?: number | null
          id?: string
          roubos?: number | null
          sinistros_total?: number | null
          sinistros_vitimas?: number | null
          violencia_domestica?: number | null
        }
        Update: {
          autos_infracao?: number | null
          created_at?: string | null
          date?: string
          homicidios?: number | null
          id?: string
          roubos?: number | null
          sinistros_total?: number | null
          sinistros_vitimas?: number | null
          violencia_domestica?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          job_title: string | null
          name: string
          role: string
          can_generate_reports: boolean | null
          allowed_tabs: Json | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          job_title?: string | null
          name: string
          role?: string
          can_generate_reports?: boolean | null
          allowed_tabs?: Json | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          job_title?: string | null
          name?: string
          role?: string
          can_generate_reports?: boolean | null
          allowed_tabs?: Json | null
        }
        Relationships: []
      }
      video_records: {
        Row: {
          created_at: string | null
          date: string
          id: string
          imprensa: number | null
          instituicoes: number | null
          operadores: number | null
          particulares: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          imprensa?: number | null
          instituicoes?: number | null
          operadores?: number | null
          particulares?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          imprensa?: number | null
          instituicoes?: number | null
          operadores?: number | null
          particulares?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
