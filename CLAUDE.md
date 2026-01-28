# Task Manager - Graphite PR Stacking Demo

## Project Purpose

This is a Task Manager application specifically designed to demonstrate **Graphite's stacked PR workflow**. The app is intentionally built with 12 incremental features that naturally stack on top of each other, showcasing how to:

- Create small, focused pull requests
- Stack PRs that depend on each other
- Review and merge changes incrementally
- Handle merge conflicts in stacked PRs
- Maintain a clean, linear git history

**This is a demo project.** Features are simple by design to keep the focus on the PR workflow, not complex application logic.

**DO NOT COMMIT THE CODE BY YOURSELF.** You are just a developer. You will be asked to commit the code by the user.

## Architecture Overview

This is a monorepo managed with Bun workspaces:

```
graphite-sample/
├── packages/
│   ├── api.com/          # Express backend API
│   ├── app.com/          # Next.js frontend
│   └── shared-types/     # Shared TypeScript types
├── CLAUDE.md            # This file
├── package.json         # Root workspace config
└── .husky/              # Git hooks
```

**Design Principles:**

- **In-memory storage** - No database needed, keeps setup simple
- **RESTful API** - Clean, predictable endpoints
- **Type-safe** - Shared types between frontend and backend
- **Incremental** - Each feature adds one clear capability
- **Independent** - Many features can be built in parallel

## Technology Stack

**Backend (api.com):**

- Express 5.x - Web server
- TypeScript - Type safety
- Vitest - Testing framework
- Port: 3001

**Frontend (app.com):**

- Next.js 16 - React framework (App Router)
- React 19 - UI library
- TailwindCSS 4 - Styling
- TypeScript - Type safety
- Vitest + Testing Library - Testing framework
- Port: 3000

**Shared:**

- Bun - Package manager and runtime
- TypeScript - Language
- Prettier - Code formatting (auto-formats on commit)
- Husky + lint-staged - Git hooks for auto-formatting
- Oxlint - Fast Rust-based linting (finds code issues)

**Note on tooling:** We use oxlint (linter) + Prettier (formatter) because they serve different purposes. Oxlint finds code quality issues and bugs, while Prettier enforces consistent formatting. The full oxc formatter isn't yet available as a CLI tool.

## Development Workflow

### Running the Application

```bash
# Install dependencies (root level)
bun install

# Start both servers concurrently
bun run dev

# Or run individually
bun run dev:api   # Backend only (http://localhost:3001)
bun run dev:app   # Frontend only (http://localhost:3000)
```

### Testing

```bash
# Run all tests (workspace-wide)
bun test

# Run tests in specific package
cd packages/api.com && bun test
cd packages/app.com && bun test

# Run tests in watch mode
bun test --watch

# Run tests with UI
bun test:ui
```

### Code Quality

```bash
# Format all files with Prettier
bun run format

# Lint all files
bun run lint

# Fix linting issues
bun run lint:fix

# Type check all packages
bun run type-check
```

**Git hooks:** Husky automatically runs Prettier on staged files before each commit via lint-staged.

## API Design

### Base URL

```
http://localhost:3001/api
```

### Data Models

#### Task

```typescript
interface Task {
  id: string; // UUID
  title: string; // Required, max 200 chars
  description?: string; // Optional, max 1000 chars
  completed: boolean; // Default: false
  category: TaskCategory; // work | personal | other
  priority: TaskPriority; // low | medium | high
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

type TaskCategory = 'work' | 'personal' | 'other';
type TaskPriority = 'low' | 'medium' | 'high';
```

#### TaskStats

```typescript
interface TaskStats {
  total: number;
  completed: number;
  active: number;
  byCategory: Record<TaskCategory, number>;
  byPriority: Record<TaskPriority, number>;
}
```

### Endpoints

#### `GET /api/tasks`

List all tasks with optional filtering.

**Query Parameters:**

- `completed` (boolean) - Filter by completion status
- `category` (TaskCategory) - Filter by category
- `priority` (TaskPriority) - Filter by priority
- `search` (string) - Search in title and description

**Response:** `200 OK`

```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Complete project",
      "description": "Finish the demo app",
      "completed": false,
      "category": "work",
      "priority": "high",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `GET /api/tasks/:id`

Get a single task by ID.

**Response:** `200 OK` | `404 Not Found`

```json
{
  "task": {
    /* Task object */
  }
}
```

#### `POST /api/tasks`

Create a new task.

**Request Body:**

```json
{
  "title": "New task",
  "description": "Optional description",
  "category": "work",
  "priority": "medium"
}
```

**Response:** `201 Created`

```json
{
  "task": {
    /* Created task */
  }
}
```

**Validation:**

- `title` is required (1-200 chars)
- `description` is optional (max 1000 chars)
- `category` defaults to "personal"
- `priority` defaults to "medium"

#### `PUT /api/tasks/:id`

Update an existing task.

**Request Body:** (all fields optional)

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true,
  "category": "personal",
  "priority": "low"
}
```

**Response:** `200 OK` | `404 Not Found`

```json
{
  "task": {
    /* Updated task */
  }
}
```

#### `DELETE /api/tasks/:id`

Delete a task.

**Response:** `204 No Content` | `404 Not Found`

#### `GET /api/stats`

Get task statistics.

**Response:** `200 OK`

```json
{
  "stats": {
    "total": 10,
    "completed": 4,
    "active": 6,
    "byCategory": {
      "work": 5,
      "personal": 3,
      "other": 2
    },
    "byPriority": {
      "low": 2,
      "medium": 5,
      "high": 3
    }
  }
}
```

### Error Responses

All errors follow this format:

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE"
  }
}
```

**Common Error Codes:**

- `400 Bad Request` - Invalid input (validation failed)
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

## Feature Status

Track the implementation progress of all features. Update status and PR numbers as you work through them.

| #   | Feature              | Description                     | Key Files                                  | Dependencies | Status      | PR  |
| --- | -------------------- | ------------------------------- | ------------------------------------------ | ------------ | ----------- | --- |
| 1   | Shared Types         | Define Task interface and types | `packages/shared-types/src/index.ts`       | None         | Completed   | -   |
| 2   | Basic CRUD Backend   | Implement task API endpoints    | `packages/api.com/src/index.ts`            | #1           | Completed   | -   |
| 3   | Basic Frontend UI    | Display task list               | `packages/app.com/app/page.tsx`            | #1, #2       | Not Started | -   |
| 4   | Add Task Form        | Create new tasks UI             | `packages/app.com/components/TaskForm.tsx` | #3           | Not Started | -   |
| 5   | Toggle Completion    | Mark tasks complete/incomplete  | `packages/app.com/components/TaskItem.tsx` | #3           | Not Started | -   |
| 6   | Delete Tasks         | Remove tasks with confirmation  | `packages/app.com/components/TaskItem.tsx` | #3           | Not Started | -   |
| 7   | Task Categories      | Add category support            | Backend + Frontend                         | #2, #3       | Not Started | -   |
| 8   | Filter by Status     | Show all/active/completed       | `packages/app.com/app/page.tsx`            | #3           | Not Started | -   |
| 9   | Task Priorities      | Add priority levels             | Backend + Frontend                         | #7           | Not Started | -   |
| 10  | Multi-Filter         | Category and priority filters   | `packages/app.com/components/Filters.tsx`  | #8, #9       | Not Started | -   |
| 11  | Search               | Find tasks by text              | Backend + Frontend                         | #2, #3       | Not Started | -   |
| 12  | Statistics Dashboard | Visual task overview            | `packages/app.com/app/stats/page.tsx`      | #2, #7, #9   | Not Started | -   |

### Feature Dependency Tree

```
1. Shared Types (foundation - no dependencies)
   │
   └─ 2. Basic CRUD Backend (depends on #1)
       │
       ├─ 3. Basic Frontend UI (depends on #1, #2)
       │   │
       │   ├─ 4. Add Task Form (depends on #3)
       │   │
       │   ├─ 5. Toggle Completion (depends on #3)
       │   │
       │   ├─ 6. Delete Tasks (depends on #3)
       │   │
       │   ├─ 8. Filter by Status (depends on #3)
       │   │
       │   └─ 11. Search (depends on #2, #3)
       │
       └─ 7. Task Categories (depends on #2, #3)
           │
           ├─ 9. Task Priorities (depends on #7)
           │   │
           │   └─ 10. Multi-Filter (depends on #8, #9)
           │
           └─ 12. Statistics Dashboard (depends on #2, #7, #9)
```

**Legend:**

- Features at the same indentation level can be built in parallel
- Features below depend on the features above them
- Numbers in parentheses show direct dependencies

### Recommended Stacking Orders

**Linear Path (safest for demos):**

```
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12
```

**Parallel-Friendly Paths (for team demos):**

- **Path A:** 1 → 2 → 3 → 4 → 7 → 9 → 12
- **Path B:** 1 → 2 → 3 → 5 → 8 → 10
- **Path C:** 1 → 2 → 3 → 6 → 11

After feature #3, you can branch out to work on #4, #5, #6, #8, or #11 in parallel since they're independent.

## Feature Implementation Details

### Feature 1: Shared Types

**Goal:** Create shared TypeScript types for type safety across backend and frontend.

**Files to modify:**

- `packages/shared-types/src/index.ts`

**Implementation:**

- Define `Task` interface
- Define `TaskCategory` and `TaskPriority` types
- Define `TaskStats` interface
- Export all types

**Testing:** TypeScript compilation should pass in both packages.

### Feature 2: Basic CRUD Backend

**Goal:** Implement REST API with in-memory storage.

**Files to modify:**

- `packages/api.com/src/index.ts`

**Implementation:**

- Create in-memory task store (array)
- Implement GET /api/tasks (list all)
- Implement GET /api/tasks/:id (get one)
- Implement POST /api/tasks (create)
- Implement PUT /api/tasks/:id (update)
- Implement DELETE /api/tasks/:id (delete)
- Add request validation
- Add error handling

**Testing:**

- Write unit tests for each endpoint
- Test validation logic
- Test error cases

### Feature 3: Basic Frontend UI

**Goal:** Display list of tasks fetched from API.

**Files to modify:**

- `packages/app.com/app/page.tsx`
- `packages/app.com/components/TaskList.tsx` (new)
- `packages/app.com/components/TaskItem.tsx` (new)

**Implementation:**

- Create API client utility
- Fetch tasks on mount
- Display task list (title, completed status)
- Show loading state
- Handle errors

**Testing:**

- Test component rendering
- Test API client
- Test loading and error states

### Feature 4: Add Task Form

**Goal:** Allow users to create new tasks.

**Files to modify:**

- `packages/app.com/components/TaskForm.tsx` (new)
- `packages/app.com/app/page.tsx` (add form)

**Implementation:**

- Create form with title and description inputs
- Add form validation
- Submit to POST /api/tasks
- Clear form on success
- Refresh task list after creation

**Testing:**

- Test form submission
- Test validation
- Test success/error handling

### Feature 5: Toggle Completion

**Goal:** Mark tasks as complete or incomplete.

**Files to modify:**

- `packages/app.com/components/TaskItem.tsx`

**Implementation:**

- Add checkbox to toggle completion
- Call PUT /api/tasks/:id with updated status
- Update UI optimistically
- Handle errors

**Testing:**

- Test toggle interaction
- Test API call
- Test optimistic updates

### Feature 6: Delete Tasks

**Goal:** Remove tasks with confirmation.

**Files to modify:**

- `packages/app.com/components/TaskItem.tsx`

**Implementation:**

- Add delete button
- Show confirmation dialog
- Call DELETE /api/tasks/:id
- Remove from list on success
- Handle errors

**Testing:**

- Test delete flow
- Test confirmation dialog
- Test error handling

### Feature 7: Task Categories

**Goal:** Organize tasks by category (work, personal, other).

**Files to modify:**

- `packages/api.com/src/index.ts` (add category field)
- `packages/app.com/components/TaskForm.tsx` (add category selector)
- `packages/app.com/components/TaskItem.tsx` (display category)

**Implementation:**

- Add category field to Task interface (already in types)
- Update API to accept/return category
- Add category selector to form (dropdown)
- Display category badge on tasks
- Default to "personal"

**Testing:**

- Test category CRUD operations
- Test category display
- Test default value

### Feature 8: Filter by Status

**Goal:** Show all tasks, only active, or only completed.

**Files to modify:**

- `packages/app.com/app/page.tsx`
- `packages/app.com/components/StatusFilter.tsx` (new)

**Implementation:**

- Add filter buttons (All, Active, Completed)
- Filter tasks client-side based on completed field
- Highlight active filter
- Persist filter in URL query params

**Testing:**

- Test filter logic
- Test UI updates
- Test URL persistence

### Feature 9: Task Priorities

**Goal:** Add priority levels to tasks.

**Files to modify:**

- `packages/api.com/src/index.ts` (add priority field)
- `packages/app.com/components/TaskForm.tsx` (add priority selector)
- `packages/app.com/components/TaskItem.tsx` (display priority)

**Implementation:**

- Add priority field to Task interface (already in types)
- Update API to accept/return priority
- Add priority selector to form (dropdown or buttons)
- Display priority badge on tasks (color-coded)
- Default to "medium"

**Testing:**

- Test priority CRUD operations
- Test priority display
- Test default value

### Feature 10: Multi-Filter

**Goal:** Filter by category and priority simultaneously.

**Files to modify:**

- `packages/app.com/components/Filters.tsx` (new)
- `packages/app.com/app/page.tsx` (use filters)

**Implementation:**

- Create filter component with category and priority dropdowns
- Apply filters to task list (AND logic)
- Show filter summary ("Showing X tasks: Work + High Priority")
- Add "Clear Filters" button
- Persist filters in URL

**Testing:**

- Test multiple filter combinations
- Test filter clearing
- Test URL persistence

### Feature 11: Search

**Goal:** Find tasks by searching title and description.

**Files to modify:**

- `packages/api.com/src/index.ts` (add search param to GET /tasks)
- `packages/app.com/components/SearchBar.tsx` (new)
- `packages/app.com/app/page.tsx` (use search)

**Implementation:**

- Add search input field
- Debounce search input (300ms)
- Call API with ?search=query
- Backend: filter tasks by title/description (case-insensitive)
- Show "No results" message
- Clear search button

**Testing:**

- Test search functionality
- Test debouncing
- Test case-insensitive matching
- Test no results state

### Feature 12: Statistics Dashboard

**Goal:** Display visual overview of task metrics.

**Files to modify:**

- `packages/api.com/src/index.ts` (add GET /api/stats)
- `packages/app.com/app/stats/page.tsx` (new)
- `packages/app.com/app/layout.tsx` (add navigation)

**Implementation:**

- Implement GET /api/stats endpoint
- Create stats page with cards/charts:
  - Total tasks
  - Completion rate (percentage)
  - Tasks by category (bar chart or pie chart)
  - Tasks by priority (bar chart)
- Add navigation link to stats page
- Auto-refresh stats

**Testing:**

- Test stats calculation
- Test stats API endpoint
- Test stats page rendering

## Coding Guidelines

### TypeScript

- Enable strict mode
- No `any` types (use `unknown` if needed)
- Define interfaces for all data structures
- Use type guards for runtime checks
- Export types from shared-types package

### React

- Use functional components with hooks
- Keep components small and focused
- Colocate related components
- Use TypeScript for props
- Extract reusable logic into custom hooks

### API Design

- Follow REST conventions
- Use proper HTTP methods and status codes
- Validate all inputs
- Return consistent error format
- Keep responses simple (no deep nesting)

### Testing

- Write tests for all features
- Test happy path and error cases
- Use descriptive test names
- Mock API calls in frontend tests
- Aim for good coverage (>80%)

### Commits

- Write clear, concise commit messages
- Use conventional commit format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `refactor:` for code changes
  - `test:` for test changes
  - `docs:` for documentation
- One logical change per commit
- Keep commits small and focused

### Pull Requests

- One feature per PR (matches feature list)
- Reference feature number in PR title
- Include before/after screenshots for UI changes
- List testing steps in PR description
- Keep PRs small (<300 lines when possible)

## Common Patterns

### API Client (Frontend)

```typescript
// lib/api.ts
const API_BASE = 'http://localhost:3001/api';

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return data.tasks;
}

export async function createTask(task: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to create task');
  const data = await res.json();
  return data.task;
}

// Similar for updateTask, deleteTask, etc.
```

### Error Handling (Backend)

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({
    error: {
      message: err.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
});
```

### Component Structure (Frontend)

```typescript
// components/TaskItem.tsx
import { Task } from 'shared-types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div className="task-item">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      <span>{task.title}</span>
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </div>
  );
}
```

## Demo Flow

This is the recommended order for live demos:

### Part 1: Foundation (15-20 min)

1. **Show project structure** - Explain monorepo setup
2. **Feature 1: Shared Types** - Define interfaces
3. **Feature 2: Basic CRUD Backend** - Build API
4. **Demo:** Test API with curl or Postman

### Part 2: Basic UI (15-20 min)

5. **Feature 3: Basic Frontend UI** - Display tasks
6. **Feature 4: Add Task Form** - Create tasks
7. **Demo:** Add tasks through UI

### Part 3: Interactions (15-20 min)

8. **Feature 5: Toggle Completion** - Mark complete
9. **Feature 6: Delete Tasks** - Remove tasks
10. **Demo:** Full CRUD workflow

### Part 4: Organization (20-25 min)

11. **Feature 7: Task Categories** - Add categories
12. **Feature 8: Filter by Status** - Add filters
13. **Feature 9: Task Priorities** - Add priorities
14. **Demo:** Organize and filter tasks

### Part 5: Advanced Features (15-20 min)

15. **Feature 10: Multi-Filter** - Combine filters
16. **Feature 11: Search** - Find tasks
17. **Feature 12: Statistics Dashboard** - View stats
18. **Demo:** Full app walkthrough

**Total time:** ~90 minutes for full implementation

### Graphite Workflow Highlights

During the demo, emphasize:

- **Creating stacks** - Show `gt create` for each feature
- **Reviewing PRs** - Review lower PRs first, then rebase upper PRs
- **Handling conflicts** - Demonstrate conflict resolution in stacks
- **Merging order** - Merge from bottom to top
- **Restacking** - Use `gt restack` after merges
- **Branch navigation** - Use `gt up` and `gt down`

## Notes for Claude Code

When implementing features during the live demo:

### Do:

- Read this CLAUDE.md file first to understand the full context
- Implement features in order (follow dependency tree)
- Update the Feature Status table as you complete each feature
- Write tests for each feature
- Follow the coding guidelines
- Keep commits small and focused
- Reference feature numbers in commits (e.g., "feat: implement feature #2")

### Don't:

- Skip features or implement out of order (breaks demo flow)
- Add features not in the list (stay focused)
- Over-engineer solutions (keep it simple)
- Forget to test (write tests for each feature)
- Make large commits (break into small logical changes)

### Before Starting Each Feature:

1. Read the feature description in this file
2. Check dependencies are complete
3. Update status to "In Progress"
4. Create a new git branch (`gt create`)

### After Completing Each Feature:

1. Write and run tests
2. Update status to "Completed"
3. Commit changes with clear message
4. Push and create PR
5. Update PR column with PR number

### If Asked to Add Something Not in the List:

- Politely suggest it would break the demo flow
- Offer to add it after the 12 core features
- Keep the focus on demonstrating Graphite workflow

### Testing Strategy:

- Backend: Test each endpoint (happy path + errors)
- Frontend: Test component rendering and interactions
- Integration: Test full user flows
- Run tests before committing: `bun test`

### Common Issues:

- **CORS errors:** Enable CORS in Express (add cors middleware)
- **Port conflicts:** Check 3000 and 3001 are available
- **Type errors:** Ensure shared-types is properly linked
- **State management:** Keep it simple, use React state/hooks

## Success Criteria

You'll know the demo is successful when:

✅ All 12 features are implemented and working
✅ Full test coverage (all tests passing)
✅ Clean git history (small, logical commits)
✅ All PRs merged successfully
✅ App works end-to-end (create, read, update, delete tasks)
✅ Filters, search, and stats all functional
✅ Code follows guidelines (TypeScript strict, no any, tested)

The goal is to demonstrate that stacked PRs make feature development:

- **Faster** - Review smaller changes quickly
- **Safer** - Test each feature independently
- **Clearer** - Each PR has a single purpose
- **Easier** - Merge conflicts are minimal and easy to fix

Good luck with the demo! 🚀
