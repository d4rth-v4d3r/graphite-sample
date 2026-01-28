import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from './TaskItem';
import { Task } from 'shared-types';

describe('TaskItem', () => {
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

  const mockOnToggle = vi.fn();

  it('renders task title', () => {
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders checkbox for task completion', () => {
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('shows checked checkbox for completed tasks', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskItem task={completedTask} onToggle={mockOnToggle} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('1');
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('applies strikethrough styling to completed task titles', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskItem task={completedTask} onToggle={mockOnToggle} />);

    const title = screen.getByText('Test Task');
    expect(title).toHaveClass('line-through');
    expect(title).toHaveClass('text-gray-500');
  });

  it('does not apply strikethrough to active task titles', () => {
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} />);

    const title = screen.getByText('Test Task');
    expect(title).not.toHaveClass('line-through');
  });

  it('has accessible aria-label', () => {
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} />);
    const checkbox = screen.getByLabelText('Mark "Test Task" as complete');
    expect(checkbox).toBeInTheDocument();
  });

  it('renders description when present', () => {
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('does not render description when absent', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined };
    render(<TaskItem task={taskWithoutDescription} onToggle={mockOnToggle} />);

    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });
});
