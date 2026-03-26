// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
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
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          job_title?: string | null
          name: string
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          job_title?: string | null
          name?: string
          role?: string
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

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: activities
//   id: uuid (not null, default: gen_random_uuid())
//   event_name: text (nullable)
//   instance: text (not null)
//   event_type: text (not null)
//   modality: text (not null)
//   location: text (not null)
//   meeting_start: timestamp with time zone (not null)
//   meeting_end: timestamp with time zone (not null)
//   has_additional_days: boolean (nullable, default: false)
//   additional_days: jsonb (nullable, default: '[]'::jsonb)
//   has_action: boolean (nullable, default: false)
//   action_start: timestamp with time zone (nullable)
//   action_end: timestamp with time zone (nullable)
//   actions: jsonb (nullable, default: '[]'::jsonb)
//   participants_pf: text (nullable)
//   participants_pj: text (nullable)
//   documents: jsonb (nullable, default: '[]'::jsonb)
//   deliberations: text (nullable)
//   description: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: audit_logs
//   id: uuid (not null, default: gen_random_uuid())
//   user_name: text (nullable)
//   user_email: text (nullable)
//   action: text (not null)
//   timestamp: timestamp with time zone (nullable, default: now())
// Table: obs_records
//   id: uuid (not null, default: gen_random_uuid())
//   date: text (not null)
//   sinistros_vitimas: integer (nullable, default: 0)
//   sinistros_total: integer (nullable, default: 0)
//   autos_infracao: integer (nullable, default: 0)
//   homicidios: integer (nullable, default: 0)
//   violencia_domestica: integer (nullable, default: 0)
//   roubos: integer (nullable, default: 0)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: profiles
//   id: uuid (not null)
//   email: text (not null)
//   name: text (not null)
//   role: text (not null, default: 'viewer'::text)
//   job_title: text (nullable)
//   avatar_url: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: video_records
//   id: uuid (not null, default: gen_random_uuid())
//   date: text (not null)
//   particulares: integer (nullable, default: 0)
//   instituicoes: integer (nullable, default: 0)
//   imprensa: integer (nullable, default: 0)
//   operadores: integer (nullable, default: 0)
//   created_at: timestamp with time zone (nullable, default: now())

// --- CONSTRAINTS ---
// Table: activities
//   PRIMARY KEY activities_pkey: PRIMARY KEY (id)
// Table: audit_logs
//   PRIMARY KEY audit_logs_pkey: PRIMARY KEY (id)
// Table: obs_records
//   PRIMARY KEY obs_records_pkey: PRIMARY KEY (id)
// Table: profiles
//   FOREIGN KEY profiles_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY profiles_pkey: PRIMARY KEY (id)
// Table: video_records
//   PRIMARY KEY video_records_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: activities
//   Policy "allow_all_activities" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: audit_logs
//   Policy "allow_all_audit" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: obs_records
//   Policy "allow_all_obs" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: profiles
//   Policy "allow_all_profiles" (ALL, PERMISSIVE) roles={public}
//     USING: true
// Table: video_records
//   Policy "allow_all_video" (ALL, PERMISSIVE) roles={public}
//     USING: true

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.profiles (id, email, name, role, job_title)
//     VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'), 'viewer', 'Visualizador')
//     ON CONFLICT (id) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//
