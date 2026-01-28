import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import type { Task, TaskCategory, TaskPriority, TaskStats } from 'shared-types';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory task store
let tasks: Task[] = [];

// Custom error class for API errors
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to find a task by id
function findTaskById(id: string): Task {
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    throw new ApiError(404, 'TASK_NOT_FOUND', `Task with id ${id} not found`);
  }
  return task;
}

// Helper function to validate task input
function validateTaskInput(data: {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
}, isUpdate = false): void {
  // Validate title
  if (!isUpdate && !data.title) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Title is required');
  }

  if (data.title !== undefined) {
    const trimmedTitle = data.title.trim();
    if (trimmedTitle.length === 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Title cannot be empty');
    }
    if (trimmedTitle.length > 200) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Title must not exceed 200 characters');
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.length > 1000) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Description must not exceed 1000 characters');
  }

  // Validate category
  if (data.category !== undefined) {
    const validCategories: TaskCategory[] = ['work', 'personal', 'other'];
    if (!validCategories.includes(data.category as TaskCategory)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Category must be work, personal, or other');
    }
  }

  // Validate priority
  if (data.priority !== undefined) {
    const validPriorities: TaskPriority[] = ['low', 'medium', 'high'];
    if (!validPriorities.includes(data.priority as TaskPriority)) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Priority must be low, medium, or high');
    }
  }
}

// Helper function to calculate task statistics
function calculateStats(): TaskStats {
  const stats: TaskStats = {
    total: tasks.length,
    completed: 0,
    active: 0,
    byCategory: { work: 0, personal: 0, other: 0 },
    byPriority: { low: 0, medium: 0, high: 0 },
  };

  tasks.forEach((task) => {
    if (task.completed) {
      stats.completed++;
    }
    stats.byCategory[task.category]++;
    stats.byPriority[task.priority]++;
  });

  stats.active = stats.total - stats.completed;

  return stats;
}

// GET /api/tasks - List all tasks with optional filtering
app.get('/api/tasks', (req, res) => {
  let filteredTasks = [...tasks];

  // Filter by completed status
  if (req.query.completed !== undefined) {
    const completed = req.query.completed === 'true';
    filteredTasks = filteredTasks.filter((task) => task.completed === completed);
  }

  // Filter by category
  if (req.query.category) {
    const category = req.query.category as TaskCategory;
    filteredTasks = filteredTasks.filter((task) => task.category === category);
  }

  // Filter by priority
  if (req.query.priority) {
    const priority = req.query.priority as TaskPriority;
    filteredTasks = filteredTasks.filter((task) => task.priority === priority);
  }

  // Filter by search (case-insensitive, matches title or description)
  if (req.query.search) {
    const searchTerm = (req.query.search as string).toLowerCase();
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm),
    );
  }

  res.json({ tasks: filteredTasks });
});

// GET /api/tasks/:id - Get a single task by ID
app.get('/api/tasks/:id', (req, res) => {
  const task = findTaskById(req.params.id);
  res.json({ task });
});

// POST /api/tasks - Create a new task
app.post('/api/tasks', (req, res) => {
  validateTaskInput(req.body);

  const now = new Date().toISOString();
  const task: Task = {
    id: randomUUID(),
    title: req.body.title.trim(),
    description: req.body.description?.trim(),
    completed: false,
    category: req.body.category || 'personal',
    priority: req.body.priority || 'medium',
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(task);
  res.status(201).json({ task });
});

// PUT /api/tasks/:id - Update an existing task
app.put('/api/tasks/:id', (req, res) => {
  const task = findTaskById(req.params.id);
  validateTaskInput(req.body, true);

  // Update fields if provided
  if (req.body.title !== undefined) {
    task.title = req.body.title.trim();
  }
  if (req.body.description !== undefined) {
    task.description = req.body.description.trim();
  }
  if (req.body.completed !== undefined) {
    task.completed = req.body.completed;
  }
  if (req.body.category !== undefined) {
    task.category = req.body.category;
  }
  if (req.body.priority !== undefined) {
    task.priority = req.body.priority;
  }

  // Update timestamp
  task.updatedAt = new Date().toISOString();

  res.json({ task });
});

// DELETE /api/tasks/:id - Delete a task
app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.params.id);
  if (taskIndex === -1) {
    throw new ApiError(404, 'TASK_NOT_FOUND', `Task with id ${req.params.id} not found`);
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// GET /api/stats - Get task statistics
app.get('/api/stats', (_req, res) => {
  const stats = calculateStats();
  res.json({ stats });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.send('Task Manager API - Ready');
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
  } else {
    console.error(err);
    res.status(500).json({
      error: {
        message: err.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

// Export function to reset store for testing
export function resetStore() {
  tasks.length = 0;
}

const PORT = process.env.PORT || 3001;

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

export default app;
