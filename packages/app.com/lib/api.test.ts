import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTasks } from './api';
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
