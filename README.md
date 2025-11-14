# Pull Request Dashboard

A modern web application for monitoring open pull requests for GitHub teams. Built with React, TypeScript, and Vite, this dashboard provides a clean interface to track PRs from repositories your team has access to.

## Features

- 📊 Real-time PR monitoring with automatic refresh
- 🔍 Configurable date filters (7/14/30 days or all time)
- 👥 Team-based repository filtering
- 📱 Progressive Web App (PWA) support
- 🎨 Clean, responsive UI with dark/light mode
- ⚡ Fast performance with Vite and React Query caching
- 🔄 Auto-refresh every 5 minutes
- 📦 Built with industry-standard tools and practices
- 🚀 Supports teams with 100+ repositories

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Query** - Data fetching and caching
- **Octokit** - GitHub API client
- **date-fns** - Date utilities
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Prerequisites

- Node.js 18+ and npm
- GitHub Personal Access Token with the following scopes:
  - `repo` - Access to repositories
  - `read:org` - Read organization data

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/shaned-ping/is-pull-request-dashboard.git
cd is-pull-request-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file and add your GitHub Personal Access Token:

```
VITE_GITHUB_TOKEN=your_github_token_here
```

To create a GitHub token:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Select scopes: `repo` and `read:org`
4. Generate and copy the token

### 4. Run the development server

```bash
npm run dev
```

Open your browser to the URL shown (typically http://localhost:5173)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report

## Project Structure

```
is-pull-request-dashboard/
├── src/
│   ├── components/        # React components
│   │   ├── FilterControl.tsx      # Date filter dropdown
│   │   ├── PullRequestCard.tsx    # Individual PR card
│   │   └── PullRequestList.tsx    # PR list container
│   ├── hooks/            # Custom React hooks
│   │   └── usePullRequests.ts     # React Query hooks for PR data
│   ├── services/         # API services
│   │   └── github.ts              # GitHub API integration via Octokit
│   ├── types/            # TypeScript type definitions
│   │   └── github.ts              # GitHub-related types
│   ├── utils/            # Utility functions
│   │   └── dateUtils.ts           # Date formatting and filtering
│   ├── test/             # Test configuration
│   │   └── setup.ts               # Vitest setup
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Application entry point
│   ├── index.css         # Global styles
│   └── vite-env.d.ts     # Vite environment type definitions
├── public/               # Static assets
├── .env.example          # Example environment variables
├── eslint.config.js      # ESLint configuration (flat config)
├── .prettierrc           # Prettier configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite and PWA configuration
├── vitest.config.ts      # Vitest test configuration
└── package.json          # Dependencies and scripts
```

## Configuration

### Customizing the Organization and Team

By default, the dashboard monitors PRs for the `pinggolf` organization's `is-ping-core` team. To customize this, edit `src/App.tsx`:

```typescript
const [org] = useState('your-org-name')
const [team] = useState('your-team-slug')
```

### How It Works

The dashboard uses a two-step approach to fetch team-relevant PRs:

1. **Fetch team repositories**: Uses GitHub's Teams API to get all repositories the team has access to
2. **Fetch and filter PRs**: Fetches all open PRs in the organization and filters them to only show PRs from team repositories

This approach:
- ✅ Handles teams with 100+ repositories without query length issues
- ✅ Shows all PRs in team repos (including from external contributors, dependabot, etc.)
- ✅ Supports pagination to fetch all results (up to GitHub's 1000 PR limit)
- ✅ Uses client-side filtering for efficient performance

### Date Filtering

Users can filter PRs by creation date:
- **Last 7 days** - Recent activity
- **Last 14 days** - Default view
- **Last 30 days** - Monthly overview
- **All time** - Complete history of open PRs

Filter preference is saved to browser localStorage and persists across sessions.

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory. You can deploy this to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## PWA Support

This app is configured as a Progressive Web App. Users can install it on their devices for a native app-like experience.

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Run linting and type checking: `npm run lint && npm run type-check`
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/my-feature`
6. Create a Pull Request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
