// Hand-written to match supabase/migrations/0001_init.sql and satisfy
// postgrest-js's `GenericSchema` constraint (every table needs a
// `Relationships` array, the schema needs a `Views` map). `Relationships` is
// left empty here rather than modelled — queries.ts already casts its way
// past deep nested-select inference for the one query that needs it, so
// there's nothing riding on it being accurate.
//
// Once the project is live, prefer regenerating this for real and dropping
// this file's manual upkeep:
//   npx supabase gen types typescript --project-id <ref> > features/cabana/supabase/types.ts

type NoRelationships = { Relationships: [] };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          color: string;
          expo_push_token: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      } & NoRelationships;
      events: {
        Row: {
          id: string;
          code: string;
          name: string;
          theme: string;
          where_text: string;
          date: string;
          start_note: string;
          host_id: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['events']['Row']>;
        Update: Partial<Database['public']['Tables']['events']['Row']>;
      } & NoRelationships;
      event_members: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          role: 'host' | 'guest';
          joined_at: string;
        };
        Insert: Partial<Database['public']['Tables']['event_members']['Row']>;
        Update: Partial<Database['public']['Tables']['event_members']['Row']>;
      } & NoRelationships;
      event_items: {
        Row: {
          id: string;
          event_id: string;
          emoji: string;
          name: string;
          claimed_by: string | null;
          done: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['event_items']['Row']>;
        Update: Partial<Database['public']['Tables']['event_items']['Row']>;
      } & NoRelationships;
      mine_items: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          name: string;
          done: boolean;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['mine_items']['Row']>;
        Update: Partial<Database['public']['Tables']['mine_items']['Row']>;
      } & NoRelationships;
      feed_entries: {
        Row: {
          id: string;
          event_id: string;
          text: string;
          who_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['feed_entries']['Row']>;
        Update: Partial<Database['public']['Tables']['feed_entries']['Row']>;
      } & NoRelationships;
    };
    Views: Record<string, never>;
    Functions: {
      create_event: {
        Args: {
          p_code: string;
          p_name: string;
          p_theme: string;
          p_where: string;
          p_date: string;
          p_start_note: string;
        };
        Returns: Database['public']['Tables']['events']['Row'];
      };
      join_event_by_code: {
        Args: { p_code: string };
        Returns: Database['public']['Tables']['events']['Row'];
      };
      leave_event: {
        Args: { p_event_id: string };
        Returns: undefined;
      };
      is_event_member: {
        Args: { target_event: string };
        Returns: boolean;
      };
    };
  };
};

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type EventRow = Database['public']['Tables']['events']['Row'];
export type EventMemberRow = Database['public']['Tables']['event_members']['Row'];
export type EventItemRow = Database['public']['Tables']['event_items']['Row'];
export type MineItemRow = Database['public']['Tables']['mine_items']['Row'];
export type FeedEntryRow = Database['public']['Tables']['feed_entries']['Row'];
