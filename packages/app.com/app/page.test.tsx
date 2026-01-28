import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Home from './page';
import { Task } from 'shared-types';
import * as api from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api', () => ({
  fetchTasks: vi.fn(),
}));

describe('Home page', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (api.fetchTasks as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<Home />);
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('displays tasks after successful fetch', async () => {
    (api.fetchTasks as ReturnType<typeof vi.fn>).mockResolvedValue(mockTasks);

    render(<Home />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    // Check tasks are displayed
    expect(screen.getByText('Task Manager')).toBeInTheDocument();
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
  });

  it('displays error message on fetch failure', async () => {
    const errorMessage = 'Failed to fetch tasks: Network error';
    (api.fetchTasks as ReturnType<typeof vi.fn>).mockRejectedValue(new Error(errorMessage));

    render(<Home />);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
  });
});
