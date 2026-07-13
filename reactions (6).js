export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      page_views: {
        Row: {
          slug: string;
          count: number;
          updated_at: string;
        };
        Insert: {
          slug: string;
          count?: number;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          count?: number;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          slug: string;
          author_name: string;
          author_email: string | null;
          body: string;
          created_at: string;
          approved: boolean;
        };
        Insert: {
          id?: string;
          slug: string;
          author_name: string;
          author_email?: string | null;
          body: string;
          created_at?: string;
          approved?: boolean;
        };
        Update: {
          id?: string;
          slug?: string;
          author_name?: string;
          author_email?: string | null;
          body?: string;
          created_at?: string;
          approved?: boolean;
        };
      };
      reactions: {
        Row: {
          id: string;
          slug: string;
          type: string;
          fingerprint: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          type: string;
          fingerprint: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          type?: string;
          fingerprint?: string;
          created_at?: string;
        };
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          confirmed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          confirmed?: boolean;
          created_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          slug?: string;
          created_at?: string;
        };
      };
    };
    Functions: {
      increment_view_count: {
        Args: { p_slug: string };
        Returns: number;
      };
    };
  };
}
