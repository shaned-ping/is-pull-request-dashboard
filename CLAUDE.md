# Claude Code Documentation

This file helps AI assistants (like Claude) understand the codebase structure, conventions, and best practices for this project.

## Project Overview

**Name:** PR Dashboard
**Purpose:** Monitor open pull requests for the is-ping-core team
**Tech Stack:** React 18, TypeScript, Vite, React Query, Octokit
**Target Platforms:** Web (primary), PWA for mobile

## Project Structure

```
is-pull-request-dashboard/
├── src/
│   ├── components/          # React UI components
│   │   ├── PullRequestCard.tsx    # Individual PR card component
│   │   └── PullRequestList.tsx    # PR list container with data fetching
│   ├── hooks/              # Custom React hooks
│   │   └── usePullRequests.ts     # Hook for fetching PRs with React Query
│   ├── services/           # External API services
│   │   └── github.ts              # GitHub API integration via Octokit
│   ├── types/              # TypeScript type definitions
│   │   └── github.ts              # GitHub-related types
│   ├── utils/              # Utility functions
│   │   └── dateUtils.ts           # Date formatting and filtering utilities
│   ├── App.tsx             # Root application component
│   ├── main.tsx            # Application entry point with providers
│   ├── index.css           # Global styles
│   └── vite-env.d.ts       # Vite environment type definitions
├── public/                 # Static assets
├── docs/                   # Additional documentation
├── .env.example            # Environment variable template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite and PWA configuration
├── eslint.config.js        # ESLint configuration (flat config)
└── .prettierrc             # Prettier configuration
```

## Key Conventions

### TypeScript
- **Strict mode enabled** - All type checking strictness flags are on
- **No implicit any** - All types must be explicitly defined
- **Interface naming** - Use PascalCase, no "I" prefix (e.g., `PullRequest`, not `IPullRequest`)
- **Type imports** - Use `import type` for type-only imports

### React Components
- **Functional components only** - No class components
- **Props interface naming** - Component name + "Props" (e.g., `PullRequestCardProps`)
- **File naming** - PascalCase matching component name (e.g., `PullRequestCard.tsx`)
- **Default exports** - Components use default export, utilities use named exports

### State Management
- **React Query** for server state (API data)
- **useState** for local component state
- **No global state library** (Redux, Zustand) - not needed for this project size

### Styling
- **CSS-in-CSS** - Using plain CSS files, no CSS-in-JS libraries
- **BEM-like naming** - Use semantic class names (e.g., `pr-card`, `pr-header`)
- **Dark/light mode** - Using `prefers-color-scheme` media query
- **Responsive design** - Mobile-first approach

### API Integration
- **Octokit** - Official GitHub API client
- **React Query** - For caching, refetching, and state management
- **Environment variables** - All secrets in `.env`, prefixed with `VITE_`
- **Error handling** - Always handle API errors gracefully

### Git Workflow
- **Branch naming** - `feature/description`, `bugfix/description`, `hotfix/description`
- **Commit messages** - Descriptive, follows conventional commits style
- **Main branch** - Protected, requires PR for changes
- **Feature branches** - All development happens here

## Core Business Logic

### PR Filtering Rules
1. **Status:** Only open PRs (`is:pr is:open`)
2. **Time window:** Created within last 14 days
3. **Team filter:** Associated with `is-ping-core` team (configurable)
4. **Sort order:** Most recently created first

### Date Handling
- All dates stored as ISO 8601 strings from GitHub API
- Display using relative time (e.g., "3 days ago") via `date-fns`
- Filtering uses date comparison in `dateUtils.ts`

### Data Flow
1. Component mounts → `usePullRequests` hook triggered
2. Hook calls `searchPullRequests()` from `github.ts`
3. Octokit makes GitHub API request
4. Response transformed to match `PullRequest` type
5. React Query caches result and manages refetch
6. Component renders with data

## Important Files

### `src/services/github.ts`
**Purpose:** GitHub API integration
**Key functions:**
- `searchPullRequests(teamName)` - Main PR search function
- `searchOrgPullRequests(org)` - Alternative org-based search

**⚠️ Configuration needed:** The GitHub search query may need customization based on your org structure.

### `src/hooks/usePullRequests.ts`
**Purpose:** React Query hook for PR data
**Features:**
- Auto-refetch every 5 minutes
- 2-minute stale time
- Error handling
- Loading states

### `vite.config.ts`
**Purpose:** Build configuration
**Includes:** PWA plugin with manifest, service worker, and offline support

## Environment Variables

```bash
VITE_GITHUB_TOKEN=<GitHub Personal Access Token>
```

**Required scopes:**
- `repo` - Access to repositories
- `read:org` - Read organization data

## Development Workflow

### Adding a New Component
1. Create file in `src/components/ComponentName.tsx`
2. Define props interface: `ComponentNameProps`
3. Add TypeScript types for all props
4. Export as default
5. Import and use in parent component

### Adding a New API Endpoint
1. Add function to `src/services/github.ts`
2. Define types in `src/types/github.ts`
3. Create hook in `src/hooks/` if needed
4. Use React Query for caching

### Styling Guidelines
1. Add classes to `src/index.css`
2. Use semantic naming (e.g., `pr-card`, not `blue-box`)
3. Ensure both light and dark modes are styled
4. Test responsive breakpoints

## Testing Strategy

**Current state:** No tests yet (TODO)

**Recommended approach:**
- **Unit tests:** Vitest for utilities and pure functions
- **Component tests:** React Testing Library
- **E2E tests:** Playwright or Cypress
- **API mocking:** MSW (Mock Service Worker)

## Performance Considerations

- **React Query caching** reduces API calls
- **Vite code splitting** for faster loads
- **PWA caching** for offline support
- **Image optimization** for avatars (GitHub CDN)

## Common Gotchas

1. **GitHub API rate limits** - Authenticated requests get 5000/hour
2. **Team search syntax** - GitHub's team search can be tricky, may need org search instead
3. **CORS** - GitHub API has proper CORS headers, no proxy needed
4. **Date timezones** - All dates in UTC, formatted for display

## Future Enhancements

Potential features to add:
- [ ] User authentication (OAuth)
- [ ] Filter by repository
- [ ] Filter by author
- [ ] PR status indicators (reviews, checks)
- [ ] Notification system
- [ ] Multiple team support
- [ ] Dark/light mode toggle (currently auto-detects)

## Related Documentation

- [README.md](./README.md) - Setup and getting started
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [UI_GUIDELINES.md](./UI_GUIDELINES.md) - Design system and UI patterns

## Questions for AI Assistants

When helping with this codebase:

1. **Maintain TypeScript strictness** - Don't add `any` types
2. **Follow existing patterns** - Match the component/hook structure
3. **Update documentation** - If you change architecture, update this file
4. **Consider performance** - React Query and Vite are optimized, keep it that way
5. **Test thoroughly** - Ensure changes work with GitHub API constraints

## Contact & Support

For questions about this codebase, see the repository issues or discussions.
