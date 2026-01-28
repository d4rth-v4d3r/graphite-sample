# Task Manager - Graphite PR Stacking Demo

A Task Manager application designed to demonstrate **Graphite's stacked PR workflow**. Features are built incrementally to showcase how to create, review, and merge stacked pull requests.

## Quick Start

```bash
# Install dependencies
bun install

# Start both servers
bun run dev

# Backend: http://localhost:3001
# Frontend: http://localhost:3000
```

## Project Structure

```
graphite-sample/
├── packages/
│   ├── api.com/          # Express backend API
│   ├── app.com/          # Next.js frontend
│   └── shared-types/     # Shared TypeScript types
├── CLAUDE.md            # Complete documentation
└── .husky/              # Git hooks
```

## Available Scripts

- `bun run dev` - Start both servers concurrently
- `bun test` - Run all tests
- `bun run format` - Format code with Prettier
- `bun run lint` - Lint code with Oxlint
- `bun run type-check` - Type check all packages

## Documentation

See [CLAUDE.md](./CLAUDE.md) for:

- Complete feature list (12 incremental features)
- API documentation
- Implementation guidelines
- Demo flow instructions
- Feature status tracking

## Features

This project includes 12 features that build on each other:

1. Shared Types
2. Basic CRUD Backend
3. Basic Frontend UI
4. Add Task Form
5. Toggle Completion
6. Delete Tasks
7. Task Categories
8. Filter by Status
9. Task Priorities
10. Multi-Filter
11. Search
12. Statistics Dashboard

Each feature is designed to be implemented as a separate PR that stacks on previous features.

## Tech Stack

- **Backend:** Express 5, TypeScript, Vitest
- **Frontend:** Next.js 16, React 19, TailwindCSS 4, Vitest
- **Tooling:** Bun, Prettier, Husky, lint-staged, Oxlint

## Development

1. Read [CLAUDE.md](./CLAUDE.md) for complete context
2. Implement features in order (follow dependency tree)
3. Create a new branch for each feature (`gt create`)
4. Write tests for each feature
5. Update feature status table in CLAUDE.md
6. Create PR and get it reviewed
7. Merge from bottom to top

## Git Hooks

Pre-commit hook automatically formats staged files with Prettier.

## License

MIT
