import { formatDistanceToNow } from 'date-fns';
import { PullRequest, ReviewState } from '../types';

/**
 * Determines if a PR has changes requested by any reviewer
 */
export const hasChangesRequested = (pr: PullRequest): boolean => {
  return (
    pr.reviews?.some((review) => review.state === 'CHANGES_REQUESTED') ||
    pr.reviewDecision === 'CHANGES_REQUESTED'
  );
};

/**
 * Determines if a PR needs review (no approvals or review required)
 */
export const needsReview = (pr: PullRequest): boolean => {
  return (
    !pr.reviews?.some((review) => review.state === 'APPROVED') ||
    pr.reviewDecision === 'REVIEW_REQUIRED'
  );
};

/**
 * Determines if a PR is approved
 */
export const isApproved = (pr: PullRequest): boolean => {
  return (
    pr.reviews?.every(
      (review) => review.state === 'APPROVED' || review.state === 'COMMENTED'
    ) || pr.reviewDecision === 'APPROVED'
  );
};

/**
 * Determines the review status of a PR
 */
export const getPRStatus = (pr: PullRequest, staleThresholdDays: number): PullRequest => {
  // Clone the PR to avoid mutating the original
  const processedPR = { ...pr };
  
  // Check if PR is a draft
  if (processedPR.draft) {
    processedPR.status = 'DRAFT';
    return processedPR;
  }
  
  // Determine review status based on priority
  if (hasChangesRequested(processedPR)) {
    processedPR.status = 'CHANGES_REQUESTED';
  } else if (needsReview(processedPR)) {
    processedPR.status = 'NEEDS_REVIEW';
  } else if (isApproved(processedPR)) {
    processedPR.status = 'APPROVED';
  } else {
    processedPR.status = 'UNKNOWN';
  }
  
  // Determine if PR is stale
  const STALE_THRESHOLD = staleThresholdDays * 24 * 60 * 60 * 1000; // days in milliseconds
  processedPR.stale = Date.now() - new Date(processedPR.updated_at).getTime() > STALE_THRESHOLD;
  
  return processedPR;
};

/**
 * Groups PRs by their review status
 */
export const groupPRsByStatus = (
  prs: PullRequest[]
): Record<ReviewState, PullRequest[]> => {
  return prs.reduce(
    (groups, pr) => {
      const status = pr.status || 'UNKNOWN';
      groups[status] = [...(groups[status] || []), pr];
      return groups;
    },
    {
      APPROVED: [],
      CHANGES_REQUESTED: [],
      NEEDS_REVIEW: [],
      DRAFT: [],
      UNKNOWN: [],
    } as Record<ReviewState, PullRequest[]>
  );
};

/**
 * Formats the time since a PR was updated
 */
export const formatTimeAgo = (dateStr: string): string => {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
};

/**
 * Filters PRs based on filter options
 */
export interface FilterOptions {
  searchQuery: string;
  repositories: string[];
  authors: string[];
  hideStale: boolean;
  sortBy: 'newest' | 'oldest' | 'updated' | 'title';
  prioritizeMyReviews: boolean;
}

export const filterAndSortPRs = (
  prs: PullRequest[],
  options: FilterOptions
): PullRequest[] => {
  const normalizedQuery = options.searchQuery.toLowerCase().trim();
  
  // First filter the PRs
  const filteredPRs = prs.filter((pr) => {
    // We always filter out drafts in the main filter (they will appear in DRAFT tab)
    if (pr.draft) {
      return false;
    }
    
    // Filter by repository if repositories are specified
    if (options.repositories.length > 0 && !options.repositories.includes(pr.repository.name)) {
      return false;
    }
    
    // Filter by author if authors are specified
    if (options.authors.length > 0 && !options.authors.includes(pr.user.login)) {
      return false;
    }
    
    // Filter out stale PRs if hideStale is true
    if (options.hideStale && pr.stale) {
      return false;
    }
    
    // Filter by search query if provided
    if (normalizedQuery) {
      return (
        pr.title.toLowerCase().includes(normalizedQuery) ||
        pr.user.login.toLowerCase().includes(normalizedQuery) ||
        pr.repository.name.toLowerCase().includes(normalizedQuery)
      );
    }
    
    return true;
  });
  
  // Then sort the filtered PRs
  return [...filteredPRs].sort((a, b) => {
    // First prioritize explicitly pinned PRs
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then prioritize PRs where the current user is requested as a reviewer if enabled
    if (options.prioritizeMyReviews) {
      if (a.userIsRequestedReviewer && !b.userIsRequestedReviewer) return -1;
      if (!a.userIsRequestedReviewer && b.userIsRequestedReviewer) return 1;
    }
    
    // Then sort by the selected sort option
    switch (options.sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'updated':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
};

/**
 * Legacy filter function (kept for backward compatibility)
 */
export const filterPRs = (
  prs: PullRequest[],
  query: string,
  showDrafts: boolean // Parameter kept for backward compatibility
): PullRequest[] => {
  // Only use drafts from the original PRs if showDrafts is true
  const filteredPrs = showDrafts ? prs : prs.filter(pr => !pr.draft);
  
  return filterAndSortPRs(
    filteredPrs,
    {
      searchQuery: query,
      repositories: [],
      authors: [],
      hideStale: true,
      sortBy: 'updated',
      prioritizeMyReviews: true
    }
  );
};

/**
 * Generates a consistent color for a repository name
 * @param repoName The repository name
 * @returns An object with background and text colors
 */
export const getRepoColor = (repoName: string): { bg: string; text: string } => {
  // Generate a hash code from the repo name
  const hash = repoName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Generate a hue from 0 to 360 from the hash
  const hue = Math.abs(hash) % 360;
  
  // Create an HSL color with moderate saturation and lightness for bg
  // and darker color for text to ensure readability
  return {
    bg: `hsl(${hue}, 80%, 90%)`,
    text: `hsl(${hue}, 80%, 30%)`
  };
};

/**
 * PIN FUNCTIONALITY
 */

const PINNED_PRS_KEY = 'pinned_prs';

// Get pinned PRs from localStorage
export const getPinnedPRs = (): string[] => {
  try {
    const pinnedPRs = localStorage.getItem(PINNED_PRS_KEY);
    return pinnedPRs ? JSON.parse(pinnedPRs) : [];
  } catch (e) {
    console.error('Error parsing pinned PRs:', e);
    return [];
  }
};

// Add PR ID to pinned list
export const pinPR = (prId: string): void => {
  const pinnedPRs = getPinnedPRs();
  if (!pinnedPRs.includes(prId)) {
    pinnedPRs.push(prId);
    localStorage.setItem(PINNED_PRS_KEY, JSON.stringify(pinnedPRs));
  }
};

// Remove PR ID from pinned list
export const unpinPR = (prId: string): void => {
  const pinnedPRs = getPinnedPRs();
  const index = pinnedPRs.indexOf(prId);
  if (index !== -1) {
    pinnedPRs.splice(index, 1);
    localStorage.setItem(PINNED_PRS_KEY, JSON.stringify(pinnedPRs));
  }
};

// Toggle PR pin status
export const togglePinPR = (prId: string): boolean => {
  const pinnedPRs = getPinnedPRs();
  const isPinned = pinnedPRs.includes(prId);
  
  if (isPinned) {
    unpinPR(prId);
    return false;
  } else {
    pinPR(prId);
    return true;
  }
};

// Apply pin status to PR list
export const applyPinStatus = (prs: PullRequest[]): PullRequest[] => {
  const pinnedPRs = getPinnedPRs();
  
  return prs.map(pr => ({
    ...pr,
    isPinned: pinnedPRs.includes(pr.id)
  }));
};