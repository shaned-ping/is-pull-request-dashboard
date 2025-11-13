# Contributing to PR Dashboard

Thank you for your interest in contributing to the PR Dashboard project! This document provides guidelines and best practices for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the project
- Show empathy towards other contributors

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- Git
- GitHub account
- GitHub Personal Access Token (for API access)

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # On GitHub, click "Fork" button
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/is-pull-request-dashboard.git
   cd is-pull-request-dashboard
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/shaned-ping/is-pull-request-dashboard.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your VITE_GITHUB_TOKEN
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy

We use a feature branch workflow:

- `main` - Production-ready code
- `feature/*` - New features (e.g., `feature/add-filtering`)
- `bugfix/*` - Bug fixes (e.g., `bugfix/fix-date-parsing`)
- `hotfix/*` - Urgent production fixes
- `docs/*` - Documentation updates

### Creating a Feature Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Keeping Your Branch Updated

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git rebase upstream/main
```

## Coding Standards

### TypeScript

- **Use strict types** - No `any` types unless absolutely necessary
- **Explicit return types** - Define return types for functions
- **Interface over type** - Prefer `interface` for object shapes
- **Naming conventions:**
  - PascalCase for types, interfaces, components
  - camelCase for variables, functions
  - UPPER_SNAKE_CASE for constants

**Example:**
```typescript
// ✅ Good
interface UserProfile {
  name: string
  email: string
}

function getUserProfile(id: string): Promise<UserProfile> {
  // ...
}

// ❌ Bad
function getUserProfile(id) {  // Missing types
  // ...
}
```

### React Components

- **Functional components only** - No class components
- **Props destructuring** - Destructure props in parameters when possible
- **Type all props** - Always define props interface
- **One component per file** - Exception: small, tightly coupled components

**Example:**
```typescript
// ✅ Good
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export default function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}

// ❌ Bad
export default function Button(props: any) {  // No proper types
  return <button onClick={props.onClick}>{props.label}</button>
}
```

### Hooks

- **Custom hooks start with "use"** - e.g., `usePullRequests`
- **React Query for API calls** - Don't use useEffect for data fetching
- **Keep hooks focused** - One responsibility per hook

### Styling

- **Use semantic class names** - e.g., `pr-card`, not `blue-box-1`
- **Mobile-first** - Start with mobile styles, add desktop with media queries
- **Support both themes** - Always style for light and dark mode
- **Avoid inline styles** - Use CSS classes instead

**Example:**
```css
/* ✅ Good */
.pr-card {
  padding: 1rem;
  background-color: #1a1a1a;
}

@media (prefers-color-scheme: light) {
  .pr-card {
    background-color: #f9f9f9;
  }
}

/* ❌ Bad */
.box1 {  /* Non-semantic name */
  padding: 1rem;
}
```

### Code Organization

- **Imports order:**
  1. React/external libraries
  2. Internal utilities/hooks
  3. Types
  4. Styles

**Example:**
```typescript
// External
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// Internal
import { usePullRequests } from '../hooks/usePullRequests'
import { formatDate } from '../utils/dateUtils'

// Types
import type { PullRequest } from '../types/github'

// Styles
import './PullRequestList.css'
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring (no feature or fix)
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build process or tooling changes

### Examples

```bash
# Feature
git commit -m "feat(api): add repository filtering to PR search"

# Bug fix
git commit -m "fix(date): correct timezone handling in date utils"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(components): extract common PR card logic"
```

### Writing Good Commit Messages

**✅ Good commits:**
- `feat(ui): add dark mode toggle button`
- `fix(api): handle rate limit errors gracefully`
- `docs(contributing): add TypeScript coding standards`

**❌ Bad commits:**
- `update stuff`
- `fixed bug`
- `changes`

## Pull Request Process

### Before Submitting

1. **Ensure code quality**
   ```bash
   npm run lint        # Check for linting errors
   npm run type-check  # Verify TypeScript types
   npm run format      # Format code with Prettier
   ```

2. **Test your changes**
   ```bash
   npm run dev         # Test locally
   npm run build       # Ensure production build works
   ```

3. **Update documentation**
   - Update README.md if adding features
   - Update CLAUDE.md if changing architecture
   - Add JSDoc comments to new functions

### Creating a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create PR on GitHub**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template

3. **PR Title Format**
   ```
   feat: Add repository filtering
   fix: Correct date timezone handling
   docs: Update contribution guidelines
   ```

4. **PR Description Should Include**
   - **What:** Brief description of changes
   - **Why:** Reason for the changes
   - **How:** Approach taken
   - **Testing:** How you tested it
   - **Screenshots:** For UI changes

### PR Example

```markdown
## Description
Add repository filtering to allow users to filter PRs by specific repos.

## Changes
- Add repository filter dropdown component
- Update GitHub API query to include repo filter
- Add new prop to PullRequestList component

## Testing
- Tested with multiple repositories
- Verified filtering works correctly
- Checked mobile responsiveness

## Screenshots
[Screenshot of new filter UI]
```

### PR Review Process

1. **Automated checks** - Must pass linting and type checking
2. **Code review** - At least one approval required
3. **Testing** - Reviewer tests changes locally
4. **Approval** - PR gets merged to main

### After Merge

1. **Delete your branch**
   ```bash
   git branch -d feature/your-feature-name
   git push origin --delete feature/your-feature-name
   ```

2. **Update your fork**
   ```bash
   git checkout main
   git pull upstream main
   git push origin main
   ```

## Testing Guidelines

### Testing Strategy

**Current:** Manual testing (automated tests to be added)

**Future:** Unit tests, component tests, E2E tests

### Manual Testing Checklist

- [ ] Feature works in Chrome
- [ ] Feature works in Firefox
- [ ] Feature works in Safari
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Light mode works
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Handles loading states
- [ ] Handles error states

## Documentation

### When to Update Documentation

- **README.md** - Adding features, changing setup
- **CLAUDE.md** - Changing architecture, adding conventions
- **CONTRIBUTING.md** - Changing workflow or standards
- **UI_GUIDELINES.md** - Adding design patterns
- **Code comments** - Complex logic, non-obvious code

### JSDoc Comments

Add JSDoc to all exported functions:

```typescript
/**
 * Fetch pull requests from GitHub API filtered by team
 * @param teamName - The GitHub team name to filter by
 * @returns Promise resolving to array of pull requests
 * @throws Error if API request fails
 */
export async function searchPullRequests(teamName: string): Promise<PullRequest[]> {
  // ...
}
```

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

Thank you for contributing! 🎉
