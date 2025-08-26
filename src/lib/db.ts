import Dexie, { Table } from 'dexie';
import { Todo, Goal } from '@/types';

export class MySubClassedDexie extends Dexie {
  todos!: Table<Todo>;
  goals!: Table<Goal>;

  constructor() {
    super('todoDatabase');
    this.version(1).stores({
      todos: '++id, text, is_complete, inserted_at', // Original schema
    });
    this.version(2).stores({ // New version for schema migration
      todos: '++id, text, is_complete, inserted_at, user_id, status', // Added user_id and status
    });
    this.version(3)
      .stores({
        todos:
          '++id, text, is_complete, inserted_at, user_id, status, priority, order',
      })
      .upgrade(async (tx) => {
        const table = tx.table<Todo>('todos');
        await table.toCollection().modify((todo) => {
          if (todo.priority == null) todo.priority = 'medium';
          if (todo.order == null) {
            // Default order based on inserted_at timestamp to keep current visual order roughly
            const ts = Date.parse(todo.inserted_at ?? '')
              ? new Date(todo.inserted_at).getTime()
              : Date.now();
            todo.order = ts;
          }
        });
      });

    // Add goals table in version 4
    this.version(4).stores({
      todos:
        '++id, text, is_complete, inserted_at, user_id, status, priority, order',
      goals: '++id, title, type, created_at, user_id, status',
    });

    // Add ordering to goals in version 5
    this.version(5)
      .stores({
        todos:
          '++id, text, is_complete, inserted_at, user_id, status, priority, order',
        goals: '++id, title, type, created_at, user_id, status, order',
      })
      .upgrade(async (tx) => {
        const table = tx.table<Goal>('goals');
        await table.toCollection().modify((goal) => {
          if (goal.order == null) {
            // Default order based on created_at timestamp
            const ts = Date.parse(goal.created_at ?? '')
              ? new Date(goal.created_at).getTime()
              : Date.now();
            goal.order = ts;
          }
        });
      });
  }
}

export const db = new MySubClassedDexie();