import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app, { resetStore } from './index.js';
import type { Task } from 'shared-types';

describe('Task Manager API', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('GET /api/tasks', () => {
    it('should return empty array when no tasks exist', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ tasks: [] });
    });

    it('should list all tasks', async () => {
      // Create two tasks
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 1', category: 'work', priority: 'high' });

      await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 2', category: 'personal', priority: 'low' });

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(2);
      expect(response.body.tasks[0].title).toBe('Task 1');
      expect(response.body.tasks[1].title).toBe('Task 2');
    });

    it('should filter by completed status', async () => {
      // Create completed and incomplete tasks
      const task1 = await request(app).post('/api/tasks').send({ title: 'Completed Task' });

      await request(app).put(`/api/tasks/${task1.body.task.id}`).send({ completed: true });

      await request(app).post('/api/tasks').send({ title: 'Incomplete Task' });

      // Filter for completed tasks
      const completedResponse = await request(app).get('/api/tasks?completed=true');
      expect(completedResponse.status).toBe(200);
      expect(completedResponse.body.tasks).toHaveLength(1);
      expect(completedResponse.body.tasks[0].title).toBe('Completed Task');

      // Filter for incomplete tasks
      const incompleteResponse = await request(app).get('/api/tasks?completed=false');
      expect(incompleteResponse.status).toBe(200);
      expect(incompleteResponse.body.tasks).toHaveLength(1);
      expect(incompleteResponse.body.tasks[0].title).toBe('Incomplete Task');
    });

    it('should filter by category', async () => {
      await request(app).post('/api/tasks').send({ title: 'Work Task', category: 'work' });

      await request(app).post('/api/tasks').send({ title: 'Personal Task', category: 'personal' });

      const response = await request(app).get('/api/tasks?category=work');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].category).toBe('work');
    });

    it('should filter by priority', async () => {
      await request(app).post('/api/tasks').send({ title: 'High Priority', priority: 'high' });

      await request(app).post('/api/tasks').send({ title: 'Low Priority', priority: 'low' });

      const response = await request(app).get('/api/tasks?priority=high');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].priority).toBe('high');
    });

    it('should search by title and description (case-insensitive)', async () => {
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Important Meeting', description: 'Discuss project' });

      await request(app)
        .post('/api/tasks')
        .send({ title: 'Shopping', description: 'Buy groceries' });

      // Search in title
      const titleResponse = await request(app).get('/api/tasks?search=meeting');
      expect(titleResponse.status).toBe(200);
      expect(titleResponse.body.tasks).toHaveLength(1);
      expect(titleResponse.body.tasks[0].title).toBe('Important Meeting');

      // Search in description
      const descResponse = await request(app).get('/api/tasks?search=groceries');
      expect(descResponse.status).toBe(200);
      expect(descResponse.body.tasks).toHaveLength(1);
      expect(descResponse.body.tasks[0].description).toBe('Buy groceries');

      // Case-insensitive search
      const caseResponse = await request(app).get('/api/tasks?search=MEETING');
      expect(caseResponse.status).toBe(200);
      expect(caseResponse.body.tasks).toHaveLength(1);
    });

    it('should apply multiple filters simultaneously', async () => {
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Work Task', category: 'work', priority: 'high' });

      await request(app)
        .post('/api/tasks')
        .send({ title: 'Personal Task', category: 'personal', priority: 'high' });

      await request(app)
        .post('/api/tasks')
        .send({ title: 'Other Task', category: 'work', priority: 'low' });

      const response = await request(app).get('/api/tasks?category=work&priority=high');

      expect(response.status).toBe(200);
      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].title).toBe('Work Task');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task by id', async () => {
      const createResponse = await request(app).post('/api/tasks').send({ title: 'Test Task' });

      const taskId = createResponse.body.task.id;
      const response = await request(app).get(`/api/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body.task.id).toBe(taskId);
      expect(response.body.task.title).toBe('Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).get('/api/tasks/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('TASK_NOT_FOUND');
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a task with valid data', async () => {
      const response = await request(app).post('/api/tasks').send({
        title: 'New Task',
        description: 'Task description',
        category: 'work',
        priority: 'high',
      });

      expect(response.status).toBe(201);
      expect(response.body.task).toMatchObject({
        title: 'New Task',
        description: 'Task description',
        category: 'work',
        priority: 'high',
        completed: false,
      });
      expect(response.body.task.id).toBeDefined();
      expect(response.body.task.createdAt).toBeDefined();
      expect(response.body.task.updatedAt).toBeDefined();
    });

    it('should apply default values for category and priority', async () => {
      const response = await request(app).post('/api/tasks').send({ title: 'Task with defaults' });

      expect(response.status).toBe(201);
      expect(response.body.task.category).toBe('personal');
      expect(response.body.task.priority).toBe('medium');
      expect(response.body.task.completed).toBe(false);
    });

    it('should trim whitespace from title and description', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '  Task with spaces  ', description: '  Description  ' });

      expect(response.status).toBe(201);
      expect(response.body.task.title).toBe('Task with spaces');
      expect(response.body.task.description).toBe('Description');
    });

    it('should require title', async () => {
      const response = await request(app).post('/api/tasks').send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('Title is required');
    });

    it('should reject empty title after trim', async () => {
      const response = await request(app).post('/api/tasks').send({ title: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('cannot be empty');
    });

    it('should reject title exceeding 200 characters', async () => {
      const longTitle = 'a'.repeat(201);
      const response = await request(app).post('/api/tasks').send({ title: longTitle });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('200 characters');
    });

    it('should accept title with exactly 200 characters', async () => {
      const exactTitle = 'a'.repeat(200);
      const response = await request(app).post('/api/tasks').send({ title: exactTitle });

      expect(response.status).toBe(201);
    });

    it('should reject description exceeding 1000 characters', async () => {
      const longDescription = 'a'.repeat(1001);
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', description: longDescription });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('1000 characters');
    });

    it('should reject invalid category', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', category: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('Category');
    });

    it('should reject invalid priority', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Test', priority: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toContain('Priority');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update task fields', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Original Title' });

      const taskId = createResponse.body.task.id;
      const originalUpdatedAt = createResponse.body.task.updatedAt;

      // Wait a bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updateResponse = await request(app).put(`/api/tasks/${taskId}`).send({
        title: 'Updated Title',
        description: 'New description',
        completed: true,
        category: 'work',
        priority: 'high',
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.task.title).toBe('Updated Title');
      expect(updateResponse.body.task.description).toBe('New description');
      expect(updateResponse.body.task.completed).toBe(true);
      expect(updateResponse.body.task.category).toBe('work');
      expect(updateResponse.body.task.priority).toBe('high');
      expect(updateResponse.body.task.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should update only provided fields', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Original', category: 'work', priority: 'high' });

      const taskId = createResponse.body.task.id;

      const updateResponse = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ completed: true });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.task.title).toBe('Original');
      expect(updateResponse.body.task.category).toBe('work');
      expect(updateResponse.body.task.priority).toBe('high');
      expect(updateResponse.body.task.completed).toBe(true);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/nonexistent-id')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('TASK_NOT_FOUND');
    });

    it('should validate updated fields', async () => {
      const createResponse = await request(app).post('/api/tasks').send({ title: 'Test Task' });

      const taskId = createResponse.body.task.id;

      // Try to update with invalid category
      const response = await request(app).put(`/api/tasks/${taskId}`).send({ category: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should allow updating title to valid new value', async () => {
      const createResponse = await request(app).post('/api/tasks').send({ title: 'Original' });

      const taskId = createResponse.body.task.id;

      const response = await request(app).put(`/api/tasks/${taskId}`).send({ title: 'New Title' });

      expect(response.status).toBe(200);
      expect(response.body.task.title).toBe('New Title');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const createResponse = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task to delete' });

      const taskId = createResponse.body.task.id;

      const deleteResponse = await request(app).delete(`/api/tasks/${taskId}`);
      expect(deleteResponse.status).toBe(204);

      // Verify task is deleted
      const getResponse = await request(app).get(`/api/tasks/${taskId}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app).delete('/api/tasks/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('TASK_NOT_FOUND');
    });

    it('should actually remove task from list', async () => {
      await request(app).post('/api/tasks').send({ title: 'Task 1' });

      const task2Response = await request(app).post('/api/tasks').send({ title: 'Task 2' });

      await request(app).post('/api/tasks').send({ title: 'Task 3' });

      // Delete middle task
      await request(app).delete(`/api/tasks/${task2Response.body.task.id}`);

      const listResponse = await request(app).get('/api/tasks');
      expect(listResponse.body.tasks).toHaveLength(2);
      expect(listResponse.body.tasks.map((t: Task) => t.title)).toEqual(['Task 1', 'Task 3']);
    });
  });

  describe('GET /api/stats', () => {
    it('should return correct statistics for empty store', async () => {
      const response = await request(app).get('/api/stats');

      expect(response.status).toBe(200);
      expect(response.body.stats).toEqual({
        total: 0,
        completed: 0,
        active: 0,
        byCategory: { work: 0, personal: 0, other: 0 },
        byPriority: { low: 0, medium: 0, high: 0 },
      });
    });

    it('should calculate correct statistics', async () => {
      // Create tasks with different categories and priorities
      const task1 = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 1', category: 'work', priority: 'high' });

      await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 2', category: 'work', priority: 'low' });

      await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 3', category: 'personal', priority: 'medium' });

      await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 4', category: 'other', priority: 'high' });

      // Mark one as completed
      await request(app).put(`/api/tasks/${task1.body.task.id}`).send({ completed: true });

      const response = await request(app).get('/api/stats');

      expect(response.status).toBe(200);
      expect(response.body.stats).toEqual({
        total: 4,
        completed: 1,
        active: 3,
        byCategory: { work: 2, personal: 1, other: 1 },
        byPriority: { low: 1, medium: 1, high: 2 },
      });
    });

    it('should update statistics after task deletion', async () => {
      const task1 = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task 1', category: 'work' });

      await request(app).post('/api/tasks').send({ title: 'Task 2', category: 'personal' });

      // Initial stats
      let response = await request(app).get('/api/stats');
      expect(response.body.stats.total).toBe(2);

      // Delete a task
      await request(app).delete(`/api/tasks/${task1.body.task.id}`);

      // Updated stats
      response = await request(app).get('/api/stats');
      expect(response.body.stats.total).toBe(1);
      expect(response.body.stats.byCategory.work).toBe(0);
      expect(response.body.stats.byCategory.personal).toBe(1);
    });
  });

  describe('Root endpoint', () => {
    it('should return welcome message', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Task Manager API');
    });
  });
});
