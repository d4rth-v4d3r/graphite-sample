import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('renders task title', () => {
    render(<TaskItem task={mockTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('shows completion indicator for completed tasks', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskItem task={completedTask} />);

    const checkmark = screen.getByLabelText('Completed');
    expect(checkmark).toBeInTheDocument();
  });

  it('applies strikethrough styling to completed task titles', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskItem task={completedTask} />);

    const title = screen.getByText('Test Task');
    expect(title).toHaveClass('line-through');
    expect(title).toHaveClass('text-gray-500');
  });

  it('does not apply strikethrough to active task titles', () => {
    render(<TaskItem task={mockTask} />);

    const title = screen.getByText('Test Task');
    expect(title).not.toHaveClass('line-through');
  });

  it('renders description when present', () => {
    render(<TaskItem task={mockTask} />);
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('does not render description when absent', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined };
    render(<TaskItem task={taskWithoutDescription} />);

    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });
});
