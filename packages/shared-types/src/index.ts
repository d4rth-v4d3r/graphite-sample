/**
 * Task category types
 */
export type TaskCategory = 'work' | 'personal' | 'other';

/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Task entity representing a single task item
 */
export interface Task {
  id: string; // UUID
  title: string; // Required, max 200 chars
  description?: string; // Optional, max 1000 chars
  completed: boolean; // Default: false
  category: TaskCategory; // work | personal | other
  priority: TaskPriority; // low | medium | high
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Task statistics and aggregated metrics
 */
export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  byCategory: Record<TaskCategory, number>;
  byPriority: Record<TaskPriority, number>;
}
