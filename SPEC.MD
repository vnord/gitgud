# GitHub PR Dashboard MVP Specification

## Project Overview
This project is an open-source MVP (Minimum Viable Product) dashboard for GitHub pull requests, designed for team use. It aims to provide a single view of all open PRs across one or more repositories in a GitHub organization, categorized by their review state (e.g., needs review, approved, changes requested, stale). It is purely a **read-only dashboard** — notifications and reminders are **not in scope**.

Slack notifications will be handled by GitHub’s official Slack integration. The MVP will be built for simplicity and ease of deployment, targeting free-tier hosting (e.g., GitHub Pages), and avoiding a backend or database where possible.

---

## Architecture Overview

### Design Principles
- **Client-side only**: No backend server.
- **Static hosting**: Deployable via GitHub Pages, Netlify, or Vercel.
- **Authentication via Personal Access Token (PAT)** entered by the user.
- **No database**: All state handled in-memory or via browser `localStorage`.
- **Single-team use**: MVP targets one GitHub organization or fixed list of repos.

### Stack
- **Frontend Framework**: React (Create React App or Vite)
- **UI Library**: Material-UI (MUI) or similar (e.g., Chakra UI)
- **GitHub API Client**: Octokit (official GitHub JavaScript SDK)
- **Optional Utility Libraries**: `date-fns` for time formatting

### Hosting
- **Primary option**: GitHub Pages
- **Alternatives**: Netlify, Vercel

---

## Features & Scope

### Core Features
1. **Authentication**
   - User inputs a GitHub PAT manually
   - Stored in `localStorage` (optional)
   - Used to authenticate API calls to GitHub

2. **Repository Configuration**
   - Hardcoded or user-input GitHub organization name
   - Optionally allow user to specify repos manually

3. **Data Fetching**
   - Fetch open PRs using GitHub REST API or GraphQL
   - Collect relevant fields: title, number, repo, author, updated date, draft status, review status

4. **Review Status Detection**
   - Determine if a PR is:
     - **Needs Review** (no approvals or incomplete approvals)
     - **Changes Requested** (a review requested changes)
     - **Approved** (all required approvals present)
     - **Stale** (no update in > N days, e.g., 7)

5. **Dashboard UI**
   - Group PRs by status
   - Display PR metadata:
     - Title (linked to PR URL)
     - Repository
     - Author
     - Time since update
     - Review state badges
     - Optional: avatar, labels
   - Optional filters: by repo, author, title

6. **User Interaction**
   - Refresh button
   - Token management (clear/change token)
   - Possibly toggle to show/hide draft PRs

7. **Error Handling**
   - Handle invalid token
   - Handle rate limiting
   - Show loading and empty states

---

## GitHub API Strategy

### Authentication
- **Method**: Personal Access Token (PAT) input manually
- **Scopes**:
  - `public_repo` for public repos
  - `repo` for private repos

### API Usage
- **Option A: REST API**
  - `GET /search/issues?q=is:pr+is:open+org:{org}`
  - `GET /repos/{owner}/{repo}/pulls/{number}/reviews`
- **Option B: GraphQL API**
  - Query PRs with `reviewDecision` field:
    - `APPROVED`
    - `CHANGES_REQUESTED`
    - `REVIEW_REQUIRED`

### Rate Limits
- Authenticated user: 5000 requests/hour
- Fetch PRs in pages (e.g., 100 per request)

---

## State & Storage

### State to Manage
- GitHub token (in memory / `localStorage`)
- Fetched PR data (in memory)
- UI preferences (e.g., org name, show drafts toggle)

### No Backend or DB
- All state lives in browser
- No need for server-side storage or caching

---

## MVP Implementation Steps

### 1. Scaffold Project
- Use Create React App or Vite
- Set up repo with GitHub Pages deployment config

### 2. Token Input
- UI modal or screen to input GitHub PAT
- Store in `localStorage`
- Validate token with simple API call (`GET /user`)

### 3. Fetch Open PRs
- Option A: Use REST API with search and per-PR review fetch
- Option B: Use GraphQL API with nested queries for reviewDecision
- Handle pagination
- Filter out draft PRs or mark clearly

### 4. Categorize PRs
```js
function getPRStatus(pr) {
  if (pr.draft) return "DRAFT";
  
  // Priority order: Changes Requested > Needs Review > Approved
  if (hasChangesRequested(pr)) return "CHANGES_REQUESTED";
  if (needsReview(pr)) return "NEEDS_REVIEW";
  if (isApproved(pr)) return "APPROVED";
  
  // Stale determination (separate from review status)
  const STALE_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  let stale = Date.now() - new Date(pr.updated_at) > STALE_THRESHOLD;
  
  return { status: pr.reviewDecision || "UNKNOWN", stale };
}

// Helper functions to determine PR status
function hasChangesRequested(pr) {
  return pr.reviews?.some(review => review.state === "CHANGES_REQUESTED") || 
         pr.reviewDecision === "CHANGES_REQUESTED";
}

function needsReview(pr) {
  return !pr.reviews?.some(review => review.state === "APPROVED") || 
         pr.reviewDecision === "REVIEW_REQUIRED";
}

function isApproved(pr) {
  return pr.reviews?.every(review => 
    review.state === "APPROVED" || review.state === "COMMENTED"
  ) || pr.reviewDecision === "APPROVED";
}
```

### 5. Build UI
- Top-level dashboard component
- Group PRs by status
- Display each PR in a Card/ListItem
  - Link to GitHub
  - Title, repo, author, updated date
  - Status badge (MUI `Chip`)
  - Optional: avatar, stale icon

### 6. Deploy
- GitHub Pages via `gh-pages` package
- Or Netlify/Vercel
- No secrets in code — all runtime via browser

### 7. Document
- Write `README.md` with:
  - What it does
  - How to get a PAT
  - How to configure and deploy
  - Usage instructions

---

## Out of Scope for MVP
- Slack integration
- PR actions (commenting, merging)
- Multi-org or user roles
- Persistent backend/database
- GitHub OAuth (future enhancement)

---

## Future Enhancements (Post-MVP)
- GitHub OAuth login (requires backend)
- Multi-user support
- CI status display
- Historical PR analytics
- Merge conflict indicator
- Real-time updates via webhooks or polling

---

## Suggested Libraries & Tools
- [`@octokit/rest`](https://github.com/octokit/octokit.js)
- [`@mui/material`](https://mui.com/)
- [`date-fns`](https://date-fns.org/) (for formatting timestamps)
- [`gh-pages`](https://www.npmjs.com/package/gh-pages) (for deployment)

---

## Example Projects to Reference
- [gh-dashboard](https://github.com/atfu-tech/gh-dashboard)
- [git-pull-request-dashboard](https://github.com/AKharytonchyk/git-pull-request-dashboard)

---

## Final Notes
- This tool is for teams that want a better overview of open PRs.
- It is intentionally lightweight, open-source, and easy to deploy.
- All sensitive data (tokens) stay on the client.
