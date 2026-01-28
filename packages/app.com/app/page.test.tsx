import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Home from './page';
import { Task } from 'shared-types';
import * as api from '@/lib/api';

// Mock the API module
vi.mock('@/lib/api', () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
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

  it('refreshes task list after task creation', async () => {
    const newTask: Task = {
      id: '3',
      title: 'New Task',
      description: 'New Description',
      completed: false,
      category: 'personal',
      priority: 'medium',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    };

    // First fetch returns initial tasks
    (api.fetchTasks as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(mockTasks)
      .mockResolvedValueOnce([...mockTasks, newTask]);

    (api.createTask as ReturnType<typeof vi.fn>).mockResolvedValue(newTask);

    render(<Home />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    // Initial tasks should be displayed
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.queryByText('New Task')).not.toBeInTheDocument();

    // Fill in the form
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'New Task' } });

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    // Wait for the new task to appear
    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });

    // Verify fetchTasks was called twice (initial + refresh)
    expect(api.fetchTasks).toHaveBeenCalledTimes(2);

    // All tasks should be displayed
    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });
});
