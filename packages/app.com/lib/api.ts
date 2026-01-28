import { Task } from 'shared-types';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

/**
 * Fetch all tasks from the backend API
 * @returns Promise resolving to array of tasks
 * @throws Error if the request fails
 */
export async function fetchTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE}/tasks`);

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }

  const data = await response.json();
  return data.tasks;
}

/**
 * Update an existing task
 * @param id - Task ID to update
 * @param updates - Partial task updates (cannot change id, createdAt, updatedAt)
 * @returns Promise resolving to the updated task
 * @throws Error if the request fails
 */
export async function updateTask(
  id: string,
  updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: 'Failed to update task' }
    }));
    throw new Error(error.error?.message || 'Failed to update task');
  }

  const data = await response.json();
  return data.task;
}
