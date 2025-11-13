# Architecture Documentation

This document describes the technical architecture, design decisions, and system structure of the PR Dashboard application.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Diagram](#architecture-diagram)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Data Flow](#data-flow)
- [Key Design Decisions](#key-design-decisions)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Performance Considerations](#performance-considerations)
- [Security](#security)
- [Deployment](#deployment)
- [Future Architecture](#future-architecture)

## System Overview

PR Dashboard is a **client-side single-page application (SPA)** built with React and TypeScript. It fetches data from the GitHub API to display open pull requests for a specific team.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser/Client                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │   React    │  │   Vite    │  │  Service Worker  │   │
│  │   App      │  │   (Build) │  │  (PWA)           │   │
│  └────────────┘  └───────────┘  └──────────────────┘   │
│         │                                  │             │
│         ↓                                  ↓             │
│  ┌────────────┐                   ┌──────────────┐     │
│  │  React     │                   │   Cache      │     │
│  │  Query     │←──────────────────│   Storage    │     │
│  └────────────┘                   └──────────────┘     │
│         │                                               │
│         ↓                                               │
│  ┌────────────┐                                        │
│  │  Octokit   │                                        │
│  │  Client    │                                        │
│  └────────────┘                                        │
│         │                                               │
└─────────┼───────────────────────────────────────────────┘
          │
          │ HTTPS
          ↓
┌─────────────────────────────────────────────────────────┐
│                    GitHub REST API                       │
│                  (api.github.com)                        │
└─────────────────────────────────────────────────────────┘
```

### Architecture Type

**Frontend-Only SPA Architecture**

- No backend server (static hosting)
- Direct API communication with GitHub
- Client-side rendering (CSR)
- Progressive Web App (PWA) capabilities

## Architecture Diagram

### Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        main.tsx                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │         QueryClientProvider (React Query)         │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │              StrictMode                      │ │  │
│  │  │  ┌───────────────────────────────────────┐  │ │  │
│  │  │  │            App.tsx                    │  │ │  │
│  │  │  │                                       │  │ │  │
│  │  │  │  ┌─────────────────────────────────┐ │  │ │  │
│  │  │  │  │    PullRequestList.tsx          │ │  │ │  │
│  │  │  │  │                                 │ │  │ │  │
│  │  │  │  │  - usePullRequests() hook       │ │  │ │  │
│  │  │  │  │  - Loading/Error/Empty states   │ │  │ │  │
│  │  │  │  │                                 │ │  │ │  │
│  │  │  │  │  ┌────────────────────────────┐ │ │  │ │  │
│  │  │  │  │  │  PullRequestCard.tsx       │ │ │  │ │  │
│  │  │  │  │  │  (rendered for each PR)    │ │ │  │ │  │
│  │  │  │  │  └────────────────────────────┘ │ │  │ │  │
│  │  │  │  └─────────────────────────────────┘ │  │ │  │
│  │  │  └───────────────────────────────────────┘  │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User Action (Page Load)
         │
         ↓
┌────────────────────────────────────────────┐
│  usePullRequests Hook                      │
│  - queryKey: ['pullRequests', teamName]    │
│  - queryFn: searchPullRequests(teamName)   │
└────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────┐
│  React Query Cache Check                   │
│  - Is data cached?                         │
│  - Is data stale?                          │
└────────────────────────────────────────────┘
         │
         ├── Cached & Fresh → Return cached data
         │
         ↓ Stale or Missing
┌────────────────────────────────────────────┐
│  github.ts Service                         │
│  - searchPullRequests(teamName)            │
│  - Build GitHub search query               │
└────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────┐
│  Octokit Client                            │
│  - octokit.search.issuesAndPullRequests()  │
│  - Auth with VITE_GITHUB_TOKEN             │
└────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────┐
│  GitHub REST API                           │
│  GET /search/issues?q=...                  │
└────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────┐
│  Response Transformation                   │
│  - Map to PullRequest type                 │
│  - Extract repository info                 │
│  - Format dates                            │
└────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────┐
│  React Query Cache Update                  │
│  - Store in cache with queryKey            │
│  - Set staleTime (2 minutes)               │
│  - Schedule refetch (5 minutes)            │
└────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────┐
│  Component Re-render                       │
│  - PullRequestList receives data           │
│  - Renders PullRequestCard for each PR     │
└────────────────────────────────────────────┘
```

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library, component-based architecture |
| **TypeScript** | 5.6.2 | Type safety, developer experience |
| **Vite** | 5.4.0 | Build tool, dev server, HMR |

### State & Data Management

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Query** | 5.59.20 | Server state, caching, refetching |
| **React Hooks** | Built-in | Local component state |

### API & Utilities

| Technology | Version | Purpose |
|------------|---------|---------|
| **Octokit** | 21.0.2 | GitHub API client |
| **date-fns** | 4.1.0 | Date manipulation and formatting |

### Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 9.15.0 | Code linting |
| **Prettier** | 3.3.3 | Code formatting |
| **TypeScript ESLint** | 8.13.0 | TypeScript linting rules |

### PWA & Build

| Technology | Version | Purpose |
|------------|---------|---------|
| **vite-plugin-pwa** | 0.20.5 | Service worker, PWA manifest |
| **@vitejs/plugin-react** | 4.3.3 | React Fast Refresh |

## Project Structure

```
is-pull-request-dashboard/
├── src/
│   ├── components/              # React components
│   │   ├── PullRequestCard.tsx  # Individual PR display
│   │   └── PullRequestList.tsx  # PR list container
│   ├── hooks/                   # Custom React hooks
│   │   └── usePullRequests.ts   # Data fetching hook
│   ├── services/                # External service integrations
│   │   └── github.ts            # GitHub API service
│   ├── types/                   # TypeScript type definitions
│   │   └── github.ts            # GitHub API types
│   ├── utils/                   # Utility functions
│   │   └── dateUtils.ts         # Date helpers
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Application entry
│   ├── index.css                # Global styles
│   └── vite-env.d.ts            # Vite type declarations
├── public/                      # Static assets
│   └── vite.svg                 # Favicon
├── docs/                        # Documentation
├── .env.example                 # Environment variable template
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript config (references)
├── tsconfig.app.json            # App TypeScript config
├── tsconfig.node.json           # Node TypeScript config
├── vite.config.ts               # Vite configuration
├── eslint.config.js             # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── .gitignore                   # Git ignore rules
├── README.md                    # Setup & getting started
├── CLAUDE.md                    # AI assistant documentation
├── CONTRIBUTING.md              # Contribution guidelines
├── UI_GUIDELINES.md             # Design system
└── ARCHITECTURE.md              # This file
```

### Directory Purposes

**`src/components/`**
- React components for UI
- Each component in its own file
- Named exports for small utilities, default for main component

**`src/hooks/`**
- Custom React hooks
- Encapsulate reusable stateful logic
- Prefix with "use" (e.g., `usePullRequests`)

**`src/services/`**
- External API integrations
- Business logic for API calls
- No React dependencies (pure functions)

**`src/types/`**
- TypeScript type definitions
- Interfaces and types used across the app
- Organized by domain (e.g., `github.ts`)

**`src/utils/`**
- Pure utility functions
- No side effects
- Easily testable

## Data Flow

### 1. Initial Load

```typescript
// 1. Component mounts
<PullRequestList teamName="is-ping-core" />

// 2. Hook executes
const { data, isLoading, error } = usePullRequests("is-ping-core")

// 3. React Query checks cache
// - Cache miss or stale → fetch data
// - Cache hit & fresh → return cached

// 4. Query function runs
queryFn: () => searchPullRequests("is-ping-core")

// 5. GitHub API call
octokit.search.issuesAndPullRequests({
  q: "is:pr is:open created:>=2024-10-30 team:is-ping-core"
})

// 6. Data transformation
// - Map API response to PullRequest[]
// - Extract repository info
// - Format dates

// 7. Cache update
// - Store with queryKey: ['pullRequests', 'is-ping-core']
// - Set staleTime: 2 minutes
// - Schedule refetchInterval: 5 minutes

// 8. Component render
// - data is available
// - isLoading = false
// - Render PullRequestCard for each item
```

### 2. Auto-Refetch (Every 5 Minutes)

```typescript
// React Query automatically:
// 1. Waits 5 minutes
// 2. Refetches in background
// 3. Updates cache silently
// 4. Component re-renders with new data
```

### 3. Manual Refetch (Future Feature)

```typescript
// User clicks refresh button
const { refetch } = usePullRequests(teamName)
await refetch()
```

## Key Design Decisions

### 1. React Query for State Management

**Decision:** Use React Query instead of Redux/Zustand

**Rationale:**
- Server state is different from client state
- Built-in caching and refetching
- Automatic background updates
- Less boilerplate than Redux
- Perfect for API-heavy apps

**Trade-offs:**
- ✅ Less code, better DX
- ✅ Automatic cache management
- ✅ Built-in loading/error states
- ❌ Additional dependency (worth it)

### 2. Client-Side Architecture (No Backend)

**Decision:** Frontend-only SPA, no backend server

**Rationale:**
- Simple deployment (static hosting)
- Lower operational costs
- GitHub API has CORS support
- PWA for offline capability
- Sufficient for current requirements

**Trade-offs:**
- ✅ Simple deployment
- ✅ No server costs
- ✅ Fast iteration
- ❌ API rate limits per user
- ❌ Token management in client
- ❌ No server-side caching

**When to add backend:**
- Need to aggregate data from multiple sources
- Server-side caching required
- API rate limits become an issue
- Need webhooks or push notifications

### 3. TypeScript Strict Mode

**Decision:** Enable all TypeScript strict checks

**Rationale:**
- Catch bugs at compile time
- Better IDE support
- Self-documenting code
- Industry best practice

**Trade-offs:**
- ✅ Fewer runtime errors
- ✅ Better refactoring
- ❌ Slightly more code
- ❌ Steeper learning curve

### 4. Vite Over Create React App

**Decision:** Use Vite instead of CRA

**Rationale:**
- Much faster dev server (ESM-based)
- Faster builds
- Better plugin ecosystem
- Active maintenance
- CRA is deprecated

**Trade-offs:**
- ✅ 10-100x faster HMR
- ✅ Modern tooling
- ✅ Smaller bundle sizes
- ❌ Newer (less Stack Overflow)

### 5. CSS Over CSS-in-JS

**Decision:** Plain CSS files, no styled-components/emotion

**Rationale:**
- Simpler for beginners
- No additional dependencies
- Fast performance (no runtime)
- Easy dark/light mode with media queries
- Project size doesn't warrant CSS-in-JS

**Trade-offs:**
- ✅ Zero runtime cost
- ✅ Simple mental model
- ❌ No dynamic styling
- ❌ Global namespace (mitigated with BEM)

### 6. date-fns Over moment.js

**Decision:** Use date-fns for date manipulation

**Rationale:**
- Smaller bundle size (tree-shakeable)
- Modern, immutable API
- moment.js is in maintenance mode
- Functional programming style

**Trade-offs:**
- ✅ 67% smaller than moment
- ✅ Tree-shakeable
- ✅ Actively maintained
- ❌ Less familiar (if coming from moment)

## API Integration

### GitHub REST API

**Endpoint:** `GET https://api.github.com/search/issues`

**Authentication:** Personal Access Token (PAT)

**Rate Limits:**
- Unauthenticated: 60 requests/hour
- Authenticated: 5,000 requests/hour

### Query Construction

```typescript
const query = `is:pr is:open created:>=${dateString} team:${teamName}`
```

**Query Parameters:**
- `is:pr` - Only pull requests
- `is:open` - Only open PRs
- `created:>=YYYY-MM-DD` - Date filter
- `team:org/team-name` - Team filter

**Alternative Queries:**
```typescript
// Organization-wide
const query = `is:pr is:open created:>=${dateString} org:${orgName}`

// Specific users
const query = `is:pr is:open created:>=${dateString} involves:${username}`
```

### Response Handling

```typescript
// API response
interface GitHubSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: Array<GitHubIssue>  // PRs are issues in GitHub API
}

// Transform to our domain model
interface PullRequest {
  id: number
  number: number
  title: string
  html_url: string
  created_at: string
  updated_at: string
  user: User
  repository: Repository
  draft: boolean
  state: 'open' | 'closed'
}
```

## State Management

### Server State (React Query)

```typescript
// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      refetchOnWindowFocus: false,    // Don't refetch on focus
    },
  },
})

// Hook usage
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['pullRequests', teamName],
  queryFn: () => searchPullRequests(teamName),
  refetchInterval: 1000 * 60 * 5,    // Auto-refetch every 5 min
  staleTime: 1000 * 60 * 2,          // Consider stale after 2 min
})
```

### Local State (React Hooks)

```typescript
// Component state
const [teamName] = useState('is-ping-core')

// Future: filters, sorting, etc.
const [filter, setFilter] = useState('all')
const [sortBy, setSortBy] = useState('created')
```

## Performance Considerations

### Optimization Strategies

1. **React Query Caching**
   - Reduces API calls
   - Background refetching
   - Stale-while-revalidate pattern

2. **Vite Code Splitting**
   - Automatic chunk splitting
   - Lazy loading (future)

3. **PWA Service Worker**
   - Cache static assets
   - Offline support
   - Fast repeat visits

4. **Image Optimization**
   - GitHub CDN for avatars
   - 20x20px small size

5. **Date Calculation Caching**
   - Calculate relative dates on render
   - Could memoize for large lists

### Performance Metrics

**Target Metrics:**
- Time to Interactive (TTI): < 3s
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s

**Current Performance:**
- Initial bundle: ~150KB gzipped
- React Query: Intelligent caching
- Vite: Fast HMR (< 50ms)

## Security

### Current Security Measures

1. **Environment Variables**
   - Token in `.env`, not committed
   - `.env.example` for template
   - Vite environment variable validation

2. **HTTPS**
   - GitHub API only accessible over HTTPS
   - Production deployment on HTTPS

3. **No Sensitive Data Storage**
   - No localStorage of tokens
   - React Query cache in memory only

4. **CSP Headers (Future)**
   - Content Security Policy
   - Prevent XSS attacks

### Security Considerations

**⚠️ Token Exposure Risk**
- Client-side token is visible in network tab
- Token should have minimal scopes (`repo`, `read:org`)
- Consider OAuth flow for production

**Recommendations for Production:**
1. Implement OAuth flow
2. Use backend proxy for API calls
3. Rotate tokens regularly
4. Monitor for leaked tokens
5. Implement rate limiting

## Deployment

### Build Process

```bash
# 1. Type checking
npm run type-check

# 2. Linting
npm run lint

# 3. Build
npm run build
# Output: dist/ directory
```

### Deployment Options

1. **Vercel** (Recommended)
   - Zero-config
   - Automatic HTTPS
   - Environment variables in dashboard
   - Edge network

2. **Netlify**
   - Similar to Vercel
   - Easy PWA support
   - Form handling (if needed)

3. **GitHub Pages**
   - Free for public repos
   - Requires build script
   - Manual environment variable setup

4. **Cloudflare Pages**
   - Fast edge network
   - Free tier generous

### Environment Variables in Production

```bash
# Set in hosting provider dashboard
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
```

### PWA Deployment

- Service worker auto-generated by vite-plugin-pwa
- Manifest included in build
- Icons required in `/public/` (192x192, 512x512)

## Future Architecture

### Potential Enhancements

**1. Backend API (Optional)**
```
┌─────────┐     ┌─────────┐     ┌──────────┐
│ Browser │────▶│ Backend │────▶│  GitHub  │
│         │◀────│   API   │◀────│   API    │
└─────────┘     └─────────┘     └──────────┘
```

**Benefits:**
- Server-side caching
- Webhook support
- Aggregate multiple teams
- Hide tokens from client

**2. Real-time Updates (WebSockets)**
- Push notifications for new PRs
- Live status updates
- Collaborative features

**3. Database Layer**
- Store historical data
- Analytics and trends
- Offline-first architecture

**4. Authentication**
- OAuth GitHub login
- User preferences
- Private repos access

**5. Multi-tenant**
- Support multiple organizations
- Team switching
- User dashboards

### Scalability Considerations

**Current:** Single team, ~100 PRs
**Future:** Multiple teams, 1000s of PRs

**Changes needed:**
- Pagination
- Virtualized lists
- Backend caching
- Database for aggregation

## Monitoring & Observability (Future)

**Recommended Tools:**
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Vercel Analytics** - Performance monitoring
- **GitHub API monitoring** - Rate limit tracking

## Documentation Updates

When architecture changes:

1. Update this document
2. Update CLAUDE.md
3. Update README.md if setup changes
4. Add migration guide if breaking changes

---

**Last Updated:** 2024-11-13
**Version:** 1.0.0
