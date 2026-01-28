'use client';

import { useEffect, useState } from 'react';
import { Task } from 'shared-types';
import { fetchTasks } from '@/lib/api';
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

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto p-8">
        <div className="text-gray-600 dark:text-gray-400">Loading tasks...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-2xl mx-auto p-8">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Task Manager</h1>
      <TaskList tasks={tasks} />
    </main>
  );
}
