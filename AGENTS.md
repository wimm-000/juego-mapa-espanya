# Agent Guidelines for juego-cordilleras-espanya

## Build/Lint/Test Commands
- **Dev**: `npm run dev` - Start development server at http://localhost:5173
- **Build**: `npm run build` - Production build
- **Typecheck**: `npm run typecheck` - Run TypeScript type checking (run after changes)
- **Database**: `npm run db:push` to sync schema, `npm run db:seed` to seed data
- **Note**: No test suite configured. Verify changes manually via `npm run dev`

## Code Style & Conventions
- **TypeScript**: Strict mode enabled. Use explicit types, prefer `type` over `interface`
- **Imports**: Use `~/` alias for app imports (e.g., `import { db } from "~/db"`). Group: React Router types first, then React, then local modules
- **Components**: Functional components with TypeScript. Export `meta` and `loader` for routes
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Database**: Drizzle ORM with SQLite. Use schema types (`Cordillera`, `NewCordillera`). Query functions in `~/db/queries.ts`
- **Styling**: TailwindCSS utility classes. No CSS modules or styled-components
- **Error Handling**: Use async/await. Return undefined for not-found cases (see `getCordilleraById`)
- **State**: React hooks (`useState`, `useEffect`). Keep state local to components
- **File Structure**: Routes in `app/routes/`, components in `app/components/`, db logic in `app/db/`
