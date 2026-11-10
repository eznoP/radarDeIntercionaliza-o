/**
 * Tipagem do banco Supabase (formato gerado por `supabase gen types`).
 * Depois de conectar o projeto real, você pode regenerar com:
 *   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PostStatus = "draft" | "published" | "archived";

/** Situação do perfil do integrante no site. */
export type ProfileStatus = "pending" | "approved" | "inactive";

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: Json | null;
          cover_image_url: string | null;
          video_url: string | null;
          category_id: string;
          author_id: string;
          is_featured: boolean;
          status: PostStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt: string;
          content?: Json | null;
          cover_image_url?: string | null;
          video_url?: string | null;
          category_id: string;
          author_id: string;
          is_featured?: boolean;
          status?: PostStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string;
          content?: Json | null;
          cover_image_url?: string | null;
          video_url?: string | null;
          category_id?: string;
          author_id?: string;
          is_featured?: boolean;
          status?: PostStatus;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          email: string | null;
          access: string | null;
          slug: string;
          role_id: string | null;
          bio: string | null;
          avatar_url: string | null;
          linkedin_url: string | null;
          lattes_url: string | null;
          website_url: string | null;
          portfolio_email: string | null;
          funcao: string | null;
          status: ProfileStatus;
          is_active: boolean;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name: string;
          email?: string | null;
          access?: string | null;
          slug: string;
          role_id?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          linkedin_url?: string | null;
          lattes_url?: string | null;
          website_url?: string | null;
          portfolio_email?: string | null;
          funcao?: string | null;
          status?: ProfileStatus;
          is_active?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          full_name?: string;
          email?: string | null;
          access?: string | null;
          slug?: string;
          role_id?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          linkedin_url?: string | null;
          lattes_url?: string | null;
          website_url?: string | null;
          portfolio_email?: string | null;
          funcao?: string | null;
          status?: ProfileStatus;
          is_active?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey";
            columns: ["role_id"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["id"];
          },
        ];
      };
      roles: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      can_publish: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      current_profile_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      post_status: PostStatus;
      profile_status: ProfileStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
