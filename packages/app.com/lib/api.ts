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
 * Create a new task
 * @param taskData - Partial task data (title, description)
 * @returns Promise resolving to created task
 * @throws Error if the request fails or validation fails
 */
export async function createTask(taskData: {
  title: string;
  description?: string;
}): Promise<Task> {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create task');
  }

  const data = await response.json();
  return data.task;
}
