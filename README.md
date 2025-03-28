# GitGud - GitHub PR Dashboard

GitGud is a lightweight, client-side dashboard for GitHub pull requests that helps teams get a better overview of PR status across repositories. This tool provides a single view of all open PRs grouped by their review status.

![GitGud PR Dashboard](./public/preview.png)

## Features

- **Overview Dashboard**: See all your open PRs in one place
- **Status Categorization**: PRs automatically grouped by:
  - Needs Review
  - Changes Requested
  - Approved
  - Draft
- **Stale PR Detection**: Highlights PRs with no activity for a configurable period
- **Organization Scanning**: Easily select repositories from your organization
- **Client-side Only**: No backend, database, or server required
- **Completely Private**: Your GitHub token stays in your browser

## Getting Started

### Prerequisites

- A GitHub Personal Access Token (PAT)
- For public repositories: Token with `public_repo` scope
- For private repositories: Token with `repo` scope

### Creating a GitHub Token

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens/new)
2. Generate a new token with the appropriate scope for your repositories
3. Copy the token - you'll need to paste it into the GitGud dashboard

### Deployment

GitGud is designed to be deployed to static hosting services:

#### GitHub Pages

1. Fork this repository
2. Enable GitHub Pages in your fork's settings
3. The site will be published at `https://[your-username].github.io/gitgud/`

#### Other Hosting Options

- Deploy to Netlify, Vercel, or any other static site hosting
- No special configuration needed - it's just static HTML/CSS/JS

## Usage

1. Enter your GitHub Personal Access Token when prompted
2. Select your organization and choose which repositories to monitor
3. Configure display options (show drafts, stale PR threshold)
4. Browse PRs categorized by their status
5. Use the search bar to filter by title, author, or repository

## Privacy

- All data processing happens in your browser
- Your GitHub token is stored in your browser's localStorage
- No data is sent to any server except GitHub's API

## Development

### Local Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/gitgud.git
cd gitgud

# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.