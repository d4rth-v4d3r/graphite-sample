import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskList } from './TaskList';
import { Task } from 'shared-types';

describe('TaskList', () => {
  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      completed: false,
      category: 'work',
      priority: 'high',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Task 2',
      completed: true,
      category: 'personal',
      priority: 'medium',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  const mockOnToggle = vi.fn();

  it('renders multiple TaskItem components', () => {
    render(<TaskList tasks={mockTasks} onToggle={mockOnToggle} />);

    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
  });

  it('shows empty state message when tasks array is empty', () => {
    render(<TaskList tasks={[]} onToggle={mockOnToggle} />);

    expect(screen.getByText('No tasks yet. Create one to get started!')).toBeInTheDocument();
  });

  it('passes correct props to TaskItem', () => {
    render(<TaskList tasks={[mockTasks[0]]} onToggle={mockOnToggle} />);

    // Verify task content is displayed (TaskItem receives correct props)
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
  });
});
