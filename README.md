<p align="center">
  <img src="public/favicon.svg" alt="Devmodoro Logo" width="80" height="80">
</p>

<h1 align="center">Devmodoro</h1>

<p align="center">
  A developer-focused productivity station that combines the proven Pomodoro Technique with tools designed specifically for software developers.
</p>

## Features

- **Smart Timer** - Customizable work and break intervals with visual and audio notifications
- **GitHub Integration** - Import and work on GitHub issues directly from your timer
- **Ambient Sounds** - Mix ambient sounds like rain, coffee shop, or fireplace for optimal focus
- **Analytics Dashboard** - Track your productivity with detailed session analytics and charts
- **Theming** - Multiple accent colors with light/dark mode support
- **Offline First** - Works offline with local data persistence using IndexedDB

## What is the Pomodoro Technique?

The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. The core principle is simple:

1. **Choose a task** - Select one specific task to focus on
2. **Set the timer** - Start a 25-minute focused work session
3. **Work until the timer rings** - Focus solely on your task without distractions
4. **Take a short break** - Rest for 5 minutes to recharge
5. **Every 4 pomodoros, take a longer break** - After 4 cycles, take a 15-30 minute break

This rhythm helps maintain high levels of focus while preventing mental fatigue.

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Routing**: TanStack Router (file-based routing)
- **State Management**: XState (timer), React Context, TanStack Query
- **Styling**: Tailwind CSS 4
- **Database**: Dexie.js (IndexedDB wrapper)
- **Audio**: Howler.js
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Testing**: Vitest + Testing Library
- **Linting**: Biome

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/burakakca/devmodoro.git
cd devmodoro

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Type-check and build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Format code with Biome |
| `pnpm check` | Run Biome check (lint + format) |
| `pnpm typecheck` | Run TypeScript type checking |

## Project Structure

```
src/
├── components/          # Shared UI components
│   └── ui/              # Reusable UI primitives
├── features/            # Feature-based modules
│   ├── analytics/       # Dashboard, metrics, charts
│   ├── audio/           # Sound mixer, audio context
│   ├── github/          # GitHub API integration
│   ├── settings/        # Settings modal, theme context
│   ├── tasks/           # Task management
│   └── timer/           # Timer component and state machine
├── routes/              # File-based routing (TanStack Router)
│   ├── __root.tsx       # Root layout
│   ├── index.tsx        # Home page (timer)
│   ├── about.tsx        # About page
│   └── analytics.tsx    # Analytics page
├── types/               # Shared TypeScript types
├── AppProviders.tsx     # Context providers wrapper
├── index.css            # Global styles and theme
└── main.tsx             # Application entry point

public/
├── audio/               # Audio files (ambient sounds, notifications)
├── favicon.svg          # App icon
├── robots.txt           # SEO robots file
└── sitemap.xml          # SEO sitemap
```

## Development

### Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting. Pre-commit hooks are set up with Husky and lint-staged to ensure code quality.

```bash
# Format and lint code
pnpm check
```

### Testing

Tests are written with Vitest and Testing Library:

```bash
# Run tests in watch mode
pnpm test

# Run with coverage
pnpm test:coverage
```

### Adding a New Route

Routes are file-based using TanStack Router. To add a new page:

1. Create a new file in `src/routes/` (e.g., `src/routes/my-page.tsx`)
2. Export a route using `createFileRoute`:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/my-page")({
  component: MyPage,
});

function MyPage() {
  return <div>My Page Content</div>;
}
```

3. The route tree will be auto-generated when you run the dev server

### Adding a New Feature

Features follow a modular structure:

```
src/features/my-feature/
├── components/      # React components
├── hooks/           # Custom hooks
├── context/         # React context (if needed)
├── services/        # Business logic
└── utils/           # Utility functions
```

## Deployment

The app is configured for deployment on Netlify with SPA routing support via `public/_redirects`.

```bash
# Build for production
pnpm build

# Preview the build
pnpm preview
```

## License

MIT
