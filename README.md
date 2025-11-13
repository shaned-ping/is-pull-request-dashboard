# Pull Request Dashboard

A modern web application for monitoring open pull requests for the is-ping-core team. Built with React, TypeScript, and Vite, this dashboard provides a clean interface to track PRs that have been open for 2 weeks or less.

## Features

- 📊 Real-time PR monitoring with automatic refresh
- 🔍 Filters PRs from the last 2 weeks
- 📱 Progressive Web App (PWA) support
- 🎨 Clean, responsive UI with dark/light mode
- ⚡ Fast performance with Vite
- 🔄 Auto-refresh every 5 minutes
- 📦 Built with industry-standard tools and practices

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

## Project Structure

```
is-pull-request-dashboard/
├── src/
│   ├── components/        # React components
│   │   ├── PullRequestCard.tsx
│   │   └── PullRequestList.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── usePullRequests.ts
│   ├── services/         # API services
│   │   └── github.ts
│   ├── types/            # TypeScript type definitions
│   │   └── github.ts
│   ├── utils/            # Utility functions
│   │   └── dateUtils.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Application entry point
│   ├── index.css         # Global styles
│   └── vite-env.d.ts     # Vite environment types
├── public/               # Static assets
├── .env.example          # Example environment variables
├── eslint.config.js      # ESLint configuration
├── .prettierrc           # Prettier configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies and scripts
```

## Configuration

### Customizing the Team

By default, the dashboard searches for PRs associated with the `is-ping-core` team. To customize this, edit `src/App.tsx`:

```typescript
const [teamName] = useState('your-team-name')
```

### GitHub API Query

The GitHub API query in `src/services/github.ts` uses the team search. You may need to adjust this based on your organization structure:

- For team-based search: `team:org/team-name`
- For organization search: `org:organization-name`
- For specific users: `involves:username1 involves:username2`

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
