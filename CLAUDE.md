# Claude Code Documentation

This file helps AI assistants (like Claude) understand the codebase structure, conventions, and best practices for this project.

## Project Overview

**Name:** PR Dashboard
**Purpose:** Monitor open pull requests for GitHub teams based on team repository access
**Tech Stack:** React 18, TypeScript, Vite, React Query, Octokit, Vitest
**Target Platforms:** Web (primary), PWA for mobile
**Current Configuration:** Monitors pinggolf/is-ping-core team (configurable)

## Project Structure

```
is-pull-request-dashboard/
├── src/
│   ├── components/          # React UI components
│   │   ├── FilterControl.tsx      # Date filter dropdown component
│   │   ├── PullRequestCard.tsx    # Individual PR card component
│   │   └── PullRequestList.tsx    # PR list container with data fetching
│   ├── hooks/              # Custom React hooks
│   │   └── usePullRequests.ts     # React Query hooks (user, team, org searches)
│   ├── services/           # External API services
│   │   └── github.ts              # GitHub API integration via Octokit
│   ├── types/              # TypeScript type definitions
│   │   └── github.ts              # GitHub-related types
│   ├── utils/              # Utility functions
│   │   └── dateUtils.ts           # Date formatting and filtering utilities
│   ├── test/               # Test configuration
│   │   └── setup.ts               # Vitest setup file
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
├── vitest.config.ts        # Vitest test configuration
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
2. **Time window:** Configurable (7/14/30 days or all time), default 14 days
3. **Team filter:** PRs from repositories the team has access to
4. **Sort order:** Most recently created first

### Team-Based Search Approach
The dashboard uses a two-step process to find relevant PRs:

1. **Fetch team repositories** via `getTeamRepositories(org, teamSlug)`
   - Uses GitHub Teams API: `GET /orgs/{org}/teams/{team_slug}/repos`
   - Supports pagination for teams with 100+ repos
   - Returns array of repository full names (e.g., `["pinggolf/repo1", "pinggolf/repo2"]`)

2. **Fetch org PRs and filter** via `searchTeamPullRequests(org, team, days)`
   - Fetches ALL open PRs in the organization with `searchOrgPullRequests(org, days)`
   - Uses pagination to fetch up to 1000 PRs (GitHub limit)
   - Filters client-side using Set for O(1) lookup: `teamRepoSet.has(pr.repository.full_name)`

**Why this approach?**
- ✅ Avoids GitHub query length limits (would exceed with 100+ repos)
- ✅ Includes ALL PRs in team repos (external contributors, dependabot, cross-team)
- ✅ Scalable and performant with parallel API calls

### Date Handling
- All dates stored as ISO 8601 strings from GitHub API
- Display using relative time (e.g., "3 days ago") via `date-fns`
- Filtering uses date comparison in `dateUtils.ts`
- User preference saved to localStorage

### Data Flow
1. Component mounts → `useTeamPullRequests` hook triggered
2. Hook calls `searchTeamPullRequests(org, team, days)` from `github.ts`
3. Two parallel API calls:
   - `getTeamRepositories()` - Fetch team's repos
   - `searchOrgPullRequests()` - Fetch org's open PRs
4. Client-side filtering: PRs filtered by team repository membership
5. Response transformed to match `PullRequest` type
6. React Query caches result (5 min stale time, auto-refetch)
7. Component renders with filtered data

## Important Files

### `src/services/github.ts`
**Purpose:** GitHub API integration via Octokit
**Key functions:**
- `getTeamRepositories(org, teamSlug)` - Fetches all repos team has access to
- `searchTeamPullRequests(org, team, days)` - **Primary function** - Team-based PR search
- `searchOrgPullRequests(org, days)` - Fetches all org PRs with pagination
- `searchUserPullRequests(username, days)` - User-based PR search (legacy support)

**Implementation details:**
- Uses `octokit.paginate()` for fetching all results (handles 100+ repos/PRs)
- Parallel API calls for performance
- Client-side filtering using Set for O(1) lookup

### `src/hooks/usePullRequests.ts`
**Purpose:** React Query hooks for PR data
**Key hooks:**
- `useTeamPullRequests(org, team, days)` - **Primary hook** - Team-based search
- `useOrgPullRequests(org, days)` - Organization-wide search
- `usePullRequests(username, days)` - User-based search (legacy support)

**Features:**
- Auto-refetch every 5 minutes
- 2-minute stale time
- Error handling and loading states
- Automatic caching and deduplication

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

**Current state:** Partial test coverage

**Existing tests:**
- ✅ `dateUtils.test.ts` - 19 tests for date utility functions
- ✅ `FilterControl.test.tsx` - 10 tests for date filter component
- ✅ `PullRequestCard.test.tsx` - 15 tests for PR card component

**Missing coverage (TODO):**
- ❌ `services/github.ts` - No tests for API functions
- ❌ `hooks/usePullRequests.ts` - No tests for React Query hooks
- ❌ `components/PullRequestList.tsx` - No tests for main container

**Testing tools:**
- **Test runner:** Vitest
- **Component testing:** React Testing Library
- **DOM environment:** jsdom
- **Assertions:** Vitest expect + @testing-library/jest-dom

**Recommended approach for new tests:**
- **Unit tests:** Mock Octokit responses for service functions
- **Hook tests:** Use React Query testing utilities
- **Component tests:** Mock hooks, test rendering and user interactions
- **E2E tests:** Consider Playwright for full integration tests

## Performance Considerations

- **React Query caching** - 5-minute refetch interval reduces API calls
- **Parallel API requests** - Team repos and org PRs fetched simultaneously
- **Client-side filtering** - Uses Set for O(1) lookup performance
- **Pagination** - Fetches all results efficiently with `octokit.paginate()`
- **Vite code splitting** - Optimized bundle size for faster loads
- **PWA caching** - Service worker enables offline support
- **Image optimization** - Avatar images served from GitHub CDN

**Scalability:**
- Handles teams with 100+ repositories
- Supports orgs with up to 1000 open PRs (GitHub search limit)
- No query length limitations

## Common Gotchas

1. **GitHub API rate limits** - Authenticated requests get 5000/hour. Teams with many repos will use more quota.
2. **Team search syntax** - GitHub's `team:org/team` search is unreliable. Use repository-based filtering instead.
3. **Query length limits** - GitHub search queries have ~256 char limit. Avoid building queries with many `repo:` filters.
4. **Pagination required** - Always use `octokit.paginate()` for complete results (teams often have 100+ repos).
5. **Search API limits** - GitHub search returns max 1000 results. For orgs with >1000 open PRs, some may not appear.
6. **Token scopes** - Requires both `repo` and `read:org` scopes for team repository access.
7. **CORS** - GitHub API has proper CORS headers, no proxy needed.
8. **Date timezones** - All dates in UTC, formatted for display with relative time.

## Future Enhancements

Completed features:
- [x] Configurable date filter (7/14/30 days, all time)
- [x] Team-based repository filtering
- [x] Support for teams with 100+ repositories
- [x] Pagination for complete results

Potential features to add:
- [ ] User authentication (OAuth/Azure AD)
- [ ] Filter by specific repository (dropdown)
- [ ] Filter by author (team members only toggle)
- [ ] PR status indicators (reviews, CI checks, mergeable status)
- [ ] Sort options (created date, updated date, number of comments)
- [ ] Notification system (browser notifications for new PRs)
- [ ] Multiple team support (compare across teams)
- [ ] Dark/light mode toggle (currently auto-detects via prefers-color-scheme)
- [ ] Export to CSV/JSON
- [ ] PR aging indicators (visual cues for stale PRs)
- [ ] Comprehensive test coverage for services and hooks

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
