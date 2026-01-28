import { Task } from 'shared-types';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  return (
    <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-center gap-2">
        {task.completed && (
          <span className="text-green-500 text-lg" aria-label="Completed">
            ✓
          </span>
        )}
        <h3
          className={`text-lg font-semibold ${
            task.completed
              ? 'line-through text-gray-500 dark:text-gray-500'
              : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {task.title}
        </h3>
      </div>
      {task.description && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
      )}
    </div>
  );
}
