import express from 'express';
// Shared types will be imported here during feature implementation
// import type { Task } from 'shared-types';

const app = express();

app.get('/', (_req, res) => {
  res.send('Hello Express!');
});

app.get('/api/users/:id', (_req, res) => {
  res.json({ id: _req.params.id });
});

app.get('/api/posts/:postId/comments/:commentId', (_req, res) => {
  res.json({ postId: _req.params.postId, commentId: _req.params.commentId });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

export default app;
