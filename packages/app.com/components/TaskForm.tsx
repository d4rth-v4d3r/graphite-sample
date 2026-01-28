'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { createTask } from '@/lib/api';

interface TaskFormProps {
  onTaskCreated: () => void;
}

export function TaskForm({ onTaskCreated }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { title?: string; description?: string } = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      errors.title = 'Title is required';
    } else if (trimmedTitle.length > 200) {
      errors.title = 'Title must not exceed 200 characters';
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 1000) {
      errors.description = 'Description must not exceed 1000 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();

      await createTask({
        title: trimmedTitle,
        description: trimmedDescription || undefined,
      });

      // Clear form on success
      setTitle('');
      setDescription('');
      setValidationErrors({});

      // Trigger parent callback to refresh task list
      onTaskCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    // Clear errors when user types
    if (validationErrors.title) {
      setValidationErrors((prev) => ({ ...prev, title: undefined }));
    }
    if (error) {
      setError(null);
    }
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    // Clear errors when user types
    if (validationErrors.description) {
      setValidationErrors((prev) => ({ ...prev, description: undefined }));
    }
    if (error) {
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Create New Task
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                     disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Enter task title"
          />
          <div className="flex justify-between mt-1">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {title.length}/200
            </div>
            {validationErrors.title && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {validationErrors.title}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            disabled={isSubmitting}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                     disabled:opacity-50 disabled:cursor-not-allowed resize-vertical"
            placeholder="Enter task description"
          />
          <div className="flex justify-between mt-1">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {description.length}/1000
            </div>
            {validationErrors.description && (
              <div className="text-sm text-red-600 dark:text-red-400">
                {validationErrors.description}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
                   text-white font-medium rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
        >
          {isSubmitting ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
