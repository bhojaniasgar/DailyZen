export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          theme_preference: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          theme_preference?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          theme_preference?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          icon: string;
          color: string;
          frequency: string;
          target_count: number;
          streak_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          icon: string;
          color: string;
          frequency: string;
          target_count: number;
          streak_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          icon?: string;
          color?: string;
          frequency?: string;
          target_count?: number;
          streak_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_entries: {
        Row: {
          id: string;
          habit_id: string;
          date: string;
          completed: boolean;
          count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          date: string;
          completed: boolean;
          count: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          date?: string;
          completed?: boolean;
          count?: number;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          priority: string;
          category: string;
          due_date: string | null;
          completed: boolean;
          recurring: boolean;
          recurring_pattern: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          priority: string;
          category: string;
          due_date?: string | null;
          completed?: boolean;
          recurring?: boolean;
          recurring_pattern?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          priority?: string;
          category?: string;
          due_date?: string | null;
          completed?: boolean;
          recurring?: boolean;
          recurring_pattern?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          category: string;
          description: string | null;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          category: string;
          description?: string | null;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          category?: string;
          description?: string | null;
          date?: string;
          created_at?: string;
        };
      };
      water_entries: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          date?: string;
          created_at?: string;
        };
      };
      fuel_entries: {
        Row: {
          id: string;
          user_id: string;
          odometer: number;
          fuel_amount: number;
          fuel_cost: number;
          date: string;
          vehicle_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          odometer: number;
          fuel_amount: number;
          fuel_cost: number;
          date: string;
          vehicle_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          odometer?: number;
          fuel_amount?: number;
          fuel_cost?: number;
          date?: string;
          vehicle_name?: string | null;
          created_at?: string;
        };
      };
      pomodoro_sessions: {
        Row: {
          id: string;
          user_id: string;
          duration: number;
          session_type: string;
          completed: boolean;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          duration: number;
          session_type: string;
          completed: boolean;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          duration?: number;
          session_type?: string;
          completed?: boolean;
          date?: string;
          created_at?: string;
        };
      };
      polls: {
        Row: {
          id: string;
          question: string;
          option_a: string;
          option_b: string;
          votes_a: number;
          votes_b: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          option_a: string;
          option_b: string;
          votes_a?: number;
          votes_b?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          option_a?: string;
          option_b?: string;
          votes_a?: number;
          votes_b?: number;
          created_at?: string;
        };
      };
      user_poll_votes: {
        Row: {
          id: string;
          user_id: string;
          poll_id: string;
          choice: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          poll_id: string;
          choice: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          poll_id?: string;
          choice?: string;
          created_at?: string;
        };
      };
    };
  };
}