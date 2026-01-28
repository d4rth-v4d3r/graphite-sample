import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from './TaskForm';
import * as api from '@/lib/api';
import { Task } from 'shared-types';

vi.mock('@/lib/api', () => ({
  createTask: vi.fn(),
}));

describe('TaskForm', () => {
  const mockOnTaskCreated = vi.fn();

  const mockCreatedTask: Task = {
    id: 'test-id',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    category: 'personal',
    priority: 'medium',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with title and description fields', () => {
    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
  });

  it('displays character counters (0/200, 0/1000 initially)', () => {
    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    expect(screen.getByText('0/200')).toBeInTheDocument();
    expect(screen.getByText('0/1000')).toBeInTheDocument();
  });

  it('updates character counter as user types', () => {
    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test' } });

    expect(screen.getByText('4/200')).toBeInTheDocument();

    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Hello World' } });

    expect(screen.getByText('11/1000')).toBeInTheDocument();
  });

  it('shows validation error when title is empty', async () => {
    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    expect(api.createTask).not.toHaveBeenCalled();
  });

  it('shows validation error when title exceeds 200 characters', async () => {
    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    const titleInput = screen.getByLabelText(/title/i);
    const longTitle = 'a'.repeat(201);
    fireEvent.change(titleInput, { target: { value: longTitle } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title must not exceed 200 characters')).toBeInTheDocument();
    });

    expect(api.createTask).not.toHaveBeenCalled();
  });

  it('shows validation error when description exceeds 1000 characters', async () => {
    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });

    const descriptionInput = screen.getByLabelText(/description/i);
    const longDescription = 'a'.repeat(1001);
    fireEvent.change(descriptionInput, { target: { value: longDescription } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Description must not exceed 1000 characters')
      ).toBeInTheDocument();
    });

    expect(api.createTask).not.toHaveBeenCalled();
  });

  it('clears validation errors when user types', async () => {
    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    // Trigger validation error
    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    // Type in title field
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'T' } });

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  it('submits form successfully and clears fields', async () => {
    (api.createTask as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatedTask);

    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createTask).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
      });
      expect(mockOnTaskCreated).toHaveBeenCalled();
    });

    // Form should be cleared
    expect(titleInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
  });

  it('trims whitespace from title and description before submission', async () => {
    (api.createTask as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatedTask);

    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    fireEvent.change(titleInput, { target: { value: '  Test Task  ' } });
    fireEvent.change(descriptionInput, { target: { value: '  Test Description  ' } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createTask).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
      });
    });
  });

  it('sends undefined for empty description', async () => {
    (api.createTask as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreatedTask);

    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createTask).toHaveBeenCalledWith({
        title: 'Test Task',
        description: undefined,
      });
    });
  });

  it('displays error banner on API failure', async () => {
    (api.createTask as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Server error'));

    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    expect(mockOnTaskCreated).not.toHaveBeenCalled();
  });

  it('keeps form populated on error for retry', async () => {
    (api.createTask as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Server error'));

    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    fireEvent.change(titleInput, { target: { value: 'Test Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    // Form should still have values
    expect(titleInput).toHaveValue('Test Task');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  it('clears error banner when user types after error', async () => {
    (api.createTask as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Server error'));

    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });

    // Type in title field
    fireEvent.change(titleInput, { target: { value: 'Test Task Updated' } });

    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText('Server error')).not.toBeInTheDocument();
    });
  });

  it('disables form and shows "Creating..." during submission', async () => {
    (api.createTask as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockCreatedTask), 100))
    );

    render(<TaskForm onTaskCreated={mockOnTaskCreated} />);

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Task' } });

    const submitButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(submitButton);

    // Should show loading state
    expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
    expect(titleInput).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    });
  });
});
