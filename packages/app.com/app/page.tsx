'use client';

import { useEffect, useState } from 'react';
import { Task } from 'shared-types';
import { fetchTasks, updateTask } from '@/lib/api';
import { TaskList } from '@/components/TaskList';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks()
      .then(setTasks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleToggleTask(id: string) {
    const taskToUpdate = tasks.find((t) => t.id === id);
    if (!taskToUpdate) return;

    const previousCompleted = taskToUpdate.completed;
    const newCompleted = !previousCompleted;

    // Optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: newCompleted } : task
      )
    );

    // Call API
    updateTask(id, { completed: newCompleted })
      .catch((err) => {
        // Rollback on error
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === id ? { ...task, completed: previousCompleted } : task
          )
        );

        console.error('Failed to toggle task:', err);
        setError(err.message);

        // Auto-clear error after 3 seconds
        setTimeout(() => setError(null), 3000);
      });
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto p-8">
        <div className="text-gray-600 dark:text-gray-400">Loading tasks...</div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Task Manager</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <TaskList tasks={tasks} onToggle={handleToggleTask} />
    </main>
  );
}
