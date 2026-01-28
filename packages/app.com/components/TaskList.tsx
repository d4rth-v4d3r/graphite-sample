import { Task } from 'shared-types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-gray-600 dark:text-gray-400 text-center py-8">
        No tasks yet. Create one to get started!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
