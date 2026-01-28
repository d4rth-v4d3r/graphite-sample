import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTasks, updateTask } from './api';
import { Task } from 'shared-types';

describe('fetchTasks', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Description 1',
      completed: false,
      category: 'work',
      priority: 'high',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Test Task 2',
      completed: true,
      category: 'personal',
      priority: 'medium',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns tasks array on success', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ tasks: mockTasks }),
    });

    global.fetch = mockFetch as unknown as typeof fetch;

    const tasks = await fetchTasks();

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks');
    expect(tasks).toEqual(mockTasks);
    expect(tasks).toHaveLength(2);
  });

  it('throws error on HTTP error', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    });

    global.fetch = mockFetch as unknown as typeof fetch;

    await expect(fetchTasks()).rejects.toThrow('Failed to fetch tasks: Internal Server Error');
  });

  it('throws error on network failure', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

    global.fetch = mockFetch as unknown as typeof fetch;

    await expect(fetchTasks()).rejects.toThrow('Network error');
  });
});

describe('updateTask', () => {
  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    category: 'work',
    priority: 'high',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('successfully updates task and returns updated task', async () => {
    const updatedTask = { ...mockTask, completed: true };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ task: updatedTask }),
    });

    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await updateTask('1', { completed: true });

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/tasks/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    expect(result).toEqual(updatedTask);
  });

  it('throws error when API returns 404 (task not found)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Task not found' } }),
    });

    global.fetch = mockFetch as unknown as typeof fetch;

    await expect(updateTask('999', { completed: true })).rejects.toThrow('Task not found');
  });

  it('throws error on network failure', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

    global.fetch = mockFetch as unknown as typeof fetch;

    await expect(updateTask('1', { completed: true })).rejects.toThrow('Network error');
  });

  it('extracts error message from API response format', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: 'Validation failed' } }),
    });

    global.fetch = mockFetch as unknown as typeof fetch;

    await expect(updateTask('1', { completed: true })).rejects.toThrow('Validation failed');
  });

  it('handles malformed error responses', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    global.fetch = mockFetch as unknown as typeof fetch;

    await expect(updateTask('1', { completed: true })).rejects.toThrow('Failed to update task');
  });
});
