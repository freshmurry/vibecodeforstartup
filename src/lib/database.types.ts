/**
 * Supabase Database Types
 * Simplified types for better compatibility
 */

export interface Database {
  public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Simple type definitions for the app
export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  credits: number;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  subscription_id: string | null;
  subscription_status: 'active' | 'canceled' | 'past_due' | 'unpaid' | null;
  trial_ends_at: string | null;
  onboarding_completed: boolean;
  preferences: any;
  role: 'admin' | 'user' | null;
};

export type UserProfileInsert = {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
  credits?: number;
  plan?: 'free' | 'pro' | 'team' | 'enterprise';
  subscription_id?: string | null;
  subscription_status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | null;
  trial_ends_at?: string | null;
  onboarding_completed?: boolean;
  preferences?: any;
  role?: 'admin' | 'user' | null;
};

export type UserProfileUpdate = Partial<UserProfileInsert>;

// Legacy compatibility types
export type Tables = any;
export type TablesInsert = any;
export type TablesUpdate = any;
export type Enums = any;