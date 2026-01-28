import { Task } from 'shared-types';

const API_BASE = 'https://graphite-sample-api-com-git-r-55e7d0-ederchamale-6767s-projects.vercel.app/api';

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
