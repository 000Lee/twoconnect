export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nickname: string
          password_hash: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nickname: string
          password_hash: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nickname?: string
          password_hash?: string
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: number
          user_id: string
          nickname: string
          content: string
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          nickname: string
          content: string
          image_url?: string | null
        }
        Update: {
          content?: string
          image_url?: string | null
        }
      }
      connections: {
        Row: {
          id: number
          user_id1: string
          user_id2: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id1: string
          user_id2: string
          status?: string
        }
        Update: {
          status?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      signup_user: {
        Args: {
          email: string
          password: string
          nickname: string
        }
        Returns: {
          success: boolean
          user_id?: string
          email?: string
          nickname?: string
          message?: string
          error?: string
        }
      }
      login_user: {
        Args: {
          email: string
          password: string
        }
        Returns: {
          success: boolean
          user_id?: string
          email?: string
          nickname?: string
          message?: string
          error?: string
        }
      }
      update_post: {
        Args: {
          p_post_id: number
          p_user_id: string
          p_content: string
          p_image_url: string | null
        }
        Returns: {
          success: boolean
          message?: string
          error?: string
        }
      }
      delete_post: {
        Args: {
          p_post_id: number
          p_user_id: string
        }
        Returns: {
          success: boolean
          message?: string
          error?: string
        }
      }
      request_connection: {
        Args: {
          p_user_id1: string
          p_user_id2: string
        }
        Returns: {
          success: boolean
          message?: string
          error?: string
        }
      }
      get_user_connections: {
        Args: {
          p_user_id: string
        }
        Returns: Array<{
          connection_id: number
          friend_id: string
          friend_nickname: string
          connection_status: string
          created_at: string
        }>
      }
      get_posts: {
        Args: {}
        Returns: Array<{
          id: number
          user_id: string
          nickname: string
          content: string
          image_url: string | null
          created_at: string
          updated_at: string
        }>
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