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
