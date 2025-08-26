export type Todo = {
  id?: number; // Make id optional for new todos before Dexie assigns it
  text: string;
  is_complete: boolean;
  inserted_at: string;
  user_id?: string; // Added user_id
  status?: 'synced' | 'pending' | 'failed'; // Added status for sync
  // New fields for priority and manual ordering within a day
  priority?: 'low' | 'medium' | 'high';
  order?: number; // lower comes first within the same day
};

export type Goal = {
  id?: number;
  title: string;
  type: 'short' | 'long';
  created_at: string;
  user_id?: string;
  status?: 'active' | 'completed' | 'archived';
  order?: number; // order within a goal type for drag-and-drop
};
