# API Documentation

This document details the API integrations and data structures used in the PR Dashboard.

## GitHub REST API Integration

### Overview

The application uses GitHub's REST API v3 to search for and retrieve pull request data.

**Base URL:** `https://api.github.com`

### Authentication

**Method:** Personal Access Token (PAT)

**Environment Variable:** `VITE_GITHUB_TOKEN`

**Required Scopes:**
- `repo` - Full control of private repositories
- `read:org` - Read organization data

**Rate Limits:**
- Authenticated: 5,000 requests/hour
- Unauthenticated: 60 requests/hour

### Endpoints Used

#### Search Issues and Pull Requests

```
GET /search/issues
```

**Query Parameters:**
- `q` (required) - Search query string
- `sort` - Sort field (created, updated, comments)
- `order` - Sort order (asc, desc)
- `per_page` - Results per page (max 100)
- `page` - Page number

**Example Request:**
```http
GET /search/issues?q=is:pr+is:open+created:>=2024-10-30+team:is-ping-core&sort=created&order=desc&per_page=100
Authorization: Bearer ghp_xxxxxxxxxxxxx
```

**Response Structure:**
```json
{
  "total_count": 42,
  "incomplete_results": false,
  "items": [
    {
      "id": 123456789,
      "number": 42,
      "title": "Add new feature",
      "html_url": "https://github.com/org/repo/pull/42",
      "created_at": "2024-11-01T10:00:00Z",
      "updated_at": "2024-11-13T15:30:00Z",
      "user": {
        "login": "username",
        "avatar_url": "https://avatars.githubusercontent.com/u/123?v=4",
        "html_url": "https://github.com/username"
      },
      "repository_url": "https://api.github.com/repos/org/repo",
      "draft": false,
      "state": "open"
    }
  ]
}
```

## Search Query Syntax

### Basic Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `is:pr` | Only pull requests | `is:pr` |
| `is:open` | Only open items | `is:open` |
| `is:closed` | Only closed items | `is:closed` |
| `is:draft` | Only draft PRs | `is:draft` |

### Date Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `created:>=DATE` | Created on or after date | `created:>=2024-11-01` |
| `created:<=DATE` | Created on or before date | `created:<=2024-11-13` |
| `created:RANGE` | Created within date range | `created:2024-11-01..2024-11-13` |
| `updated:>=DATE` | Updated on or after date | `updated:>=2024-11-01` |

### Team/Organization Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `team:ORG/TEAM` | Team mention | `team:org/team-name` |
| `org:ORG` | Organization | `org:facebook` |
| `user:USERNAME` | Specific user | `user:torvalds` |
| `author:USERNAME` | PR author | `author:octocat` |
| `involves:USERNAME` | User involved | `involves:username` |
| `assignee:USERNAME` | Assigned to user | `assignee:username` |

### Repository Filters

| Filter | Description | Example |
|--------|-------------|---------|
| `repo:OWNER/NAME` | Specific repository | `repo:facebook/react` |
| `language:LANGUAGE` | By programming language | `language:typescript` |

### Combined Query Examples

**Team PRs from last 2 weeks:**
```
is:pr is:open created:>=2024-10-30 team:org/team-name
```

**Organization PRs (alternative):**
```
is:pr is:open created:>=2024-10-30 org:my-company
```

**Specific users' PRs:**
```
is:pr is:open created:>=2024-10-30 involves:user1 involves:user2
```

**Repository-specific PRs:**
```
is:pr is:open created:>=2024-10-30 repo:org/repository-name
```

## Data Transformation

The GitHub API returns data in a specific format that we transform for our application.

### GitHub API Response → PullRequest Type

```typescript
// GitHub API structure
interface GitHubIssue {
  id: number
  number: number
  title: string
  html_url: string
  created_at: string
  updated_at: string
  user: { login: string, avatar_url: string, html_url: string } | null
  repository_url: string  // Note: API URL format
  draft?: boolean
  state: string
}

// Our application type
interface PullRequest {
  id: number
  number: number
  title: string
  html_url: string
  created_at: string
  updated_at: string
  user: { login: string, avatar_url: string, html_url: string }
  repository: { name: string, full_name: string, html_url: string }  // Transformed
  draft: boolean
  state: 'open' | 'closed'
}
```

### Transformation Logic

```typescript
const pullRequests: PullRequest[] = response.data.items.map((item) => ({
  id: item.id,
  number: item.number,
  title: item.title,
  html_url: item.html_url,
  created_at: item.created_at,
  updated_at: item.updated_at,

  // Handle null user (deleted accounts)
  user: {
    login: item.user?.login || 'unknown',
    avatar_url: item.user?.avatar_url || '',
    html_url: item.user?.html_url || '',
  },

  // Extract repository info from API URL
  repository: {
    name: item.repository_url.split('/').pop() || '',
    full_name: item.repository_url.split('/').slice(-2).join('/') || '',
    html_url: item.repository_url.replace('api.github.com/repos', 'github.com'),
  },

  draft: item.draft || false,
  state: item.state as 'open' | 'closed',
}))
```

## Caching Strategy

### React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})
```

### Per-Query Configuration

```typescript
useQuery({
  queryKey: ['pullRequests', teamName],
  queryFn: () => searchPullRequests(teamName),
  refetchInterval: 1000 * 60 * 5,    // Auto-refetch every 5 minutes
  staleTime: 1000 * 60 * 2,          // Consider stale after 2 minutes
})
```

### Cache Behavior

1. **Initial Load**
   - Query executes
   - Data cached with key `['pullRequests', teamName]`
   - Cache marked as fresh for 2 minutes

2. **Subsequent Loads (< 2 minutes)**
   - Cached data returned immediately
   - No API call made

3. **Subsequent Loads (> 2 minutes, < 5 minutes)**
   - Cached data returned immediately
   - Background refetch initiated
   - UI updates when new data arrives

4. **After 5 Minutes**
   - Automatic refetch triggered
   - Cached data shown during fetch
   - UI updates seamlessly

## Error Handling

### API Errors

```typescript
try {
  const response = await octokit.search.issuesAndPullRequests({ ... })
  return transformResponse(response)
} catch (error) {
  console.error('Error fetching pull requests:', error)
  throw error  // Propagate to React Query
}
```

### React Query Error States

```typescript
const { data, isLoading, error } = usePullRequests(teamName)

if (error) {
  // error is typed as Error
  console.error(error.message)
}
```

### Common Error Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/missing token | Check VITE_GITHUB_TOKEN |
| 403 Forbidden | Rate limit exceeded | Wait or use authenticated token |
| 403 Forbidden | Insufficient scopes | Add repo, read:org scopes |
| 422 Validation Failed | Invalid query syntax | Check search query format |
| 503 Service Unavailable | GitHub API down | Retry later |

## API Testing

### Using curl

```bash
# Test authentication
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/user

# Test search query
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  "https://api.github.com/search/issues?q=is:pr+is:open+created:>=2024-10-30+org:my-org"
```

### Using GitHub CLI

```bash
# Test search
gh api /search/issues -f q="is:pr is:open created:>=2024-10-30 org:my-org"
```

### Rate Limit Checking

```bash
# Check current rate limit status
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/rate_limit
```

**Response:**
```json
{
  "resources": {
    "core": {
      "limit": 5000,
      "remaining": 4999,
      "reset": 1699999999
    },
    "search": {
      "limit": 30,
      "remaining": 29,
      "reset": 1699999999
    }
  }
}
```

## Future API Enhancements

### Pagination

Currently limited to 100 results. To support more:

```typescript
async function fetchAllPullRequests(teamName: string): Promise<PullRequest[]> {
  const allPRs: PullRequest[] = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const response = await octokit.search.issuesAndPullRequests({
      q: query,
      per_page: 100,
      page,
    })

    allPRs.push(...transformResponse(response))
    hasMore = response.data.items.length === 100
    page++
  }

  return allPRs
}
```

### GraphQL API

For more efficient querying, consider GitHub's GraphQL API:

```graphql
query {
  search(query: "is:pr is:open created:>=2024-10-30 team:org/team", type: ISSUE, first: 100) {
    nodes {
      ... on PullRequest {
        id
        number
        title
        url
        createdAt
        updatedAt
        author {
          login
          avatarUrl
          url
        }
        repository {
          name
          nameWithOwner
          url
        }
        isDraft
        state
      }
    }
  }
}
```

## References

- [GitHub REST API Documentation](https://docs.github.com/en/rest)
- [GitHub Search Syntax](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [Octokit REST.js](https://octokit.github.io/rest.js/)
