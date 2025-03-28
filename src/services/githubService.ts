import { Octokit } from '@octokit/rest';
import { PullRequest, Repository, Review } from '../types';
import { getPRStatus } from '../utils/prUtils';

// Create Octokit instance with the token
const createOctokit = (token: string) => {
  return new Octokit({ auth: token });
};

/**
 * Fetch repositories for an organization
 */
export const fetchOrganizationRepos = async (
  token: string,
  orgName: string
): Promise<Repository[]> => {
  try {
    const octokit = createOctokit(token);
    
    // Fetch repositories for the organization
    const { data } = await octokit.repos.listForOrg({
      org: orgName,
      sort: 'updated',
      per_page: 100,
    });
    
    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
      },
    }));
  } catch (error) {
    console.error('Error fetching organization repos:', error);
    throw error;
  }
};

/**
 * Fetch review information for a single PR
 */
export const fetchPRReviews = async (
  token: string,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<Review[]> => {
  try {
    const octokit = createOctokit(token);
    
    const { data } = await octokit.pulls.listReviews({
      owner,
      repo,
      pull_number: pullNumber,
    });
    
    return data.map((review) => ({
      id: review.id.toString(),
      state: review.state,
      user: {
        login: review.user?.login || 'unknown',
        avatar_url: review.user?.avatar_url || '',
      },
      submitted_at: review.submitted_at || '',
    }));
  } catch (error) {
    console.error(`Error fetching reviews for PR #${pullNumber}:`, error);
    return [];
  }
};

/**
 * Fetch open PRs for a specific repository
 */
export const fetchRepositoryPRs = async (
  token: string,
  owner: string,
  repo: string,
  staleThresholdDays: number
): Promise<PullRequest[]> => {
  try {
    const octokit = createOctokit(token);
    
    // Fetch open PRs for the repository
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state: 'open',
      per_page: 100,
    });
    
    const prs = await Promise.all(
      data.map(async (pr) => {
        // Fetch reviews for each PR
        const reviews = await fetchPRReviews(token, owner, repo, pr.number);
        
        const pullRequest: PullRequest = {
          id: pr.id.toString(),
          number: pr.number,
          title: pr.title,
          html_url: pr.html_url,
          state: pr.state,
          draft: pr.draft || false,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          user: {
            login: pr.user?.login || 'unknown',
            avatar_url: pr.user?.avatar_url || '',
          },
          repository: {
            name: repo,
            full_name: `${owner}/${repo}`,
            html_url: `https://github.com/${owner}/${repo}`,
          },
          reviews,
        };
        
        // Process and categorize the PR
        return getPRStatus(pullRequest, staleThresholdDays);
      })
    );
    
    return prs;
  } catch (error) {
    console.error(`Error fetching PRs for ${owner}/${repo}:`, error);
    return [];
  }
};

/**
 * Fetch PRs for multiple repositories
 */
export const fetchAllPRs = async (
  token: string,
  repositories: Repository[],
  staleThresholdDays: number
): Promise<PullRequest[]> => {
  try {
    const prPromises = repositories.map((repo) => {
      const [owner, repoName] = repo.full_name.split('/');
      return fetchRepositoryPRs(token, owner, repoName, staleThresholdDays);
    });
    
    const prArrays = await Promise.all(prPromises);
    return prArrays.flat();
  } catch (error) {
    console.error('Error fetching all PRs:', error);
    return [];
  }
};

/**
 * Validate GitHub token
 */
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const octokit = createOctokit(token);
    const { data } = await octokit.users.getAuthenticated();
    return !!data;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};