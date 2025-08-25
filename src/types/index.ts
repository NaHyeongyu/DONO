export type Todo = {
  id: number; // Changed from string to number to match Supabase bigint
  text: string;
  is_complete: boolean; // Changed from done to is_complete
  inserted_at: string; // Changed from createdAt to inserted_at
};
