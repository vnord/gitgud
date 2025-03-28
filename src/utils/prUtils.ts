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
  options: FilterOptions,
  showDrafts: boolean
): PullRequest[] => {
  const normalizedQuery = options.searchQuery.toLowerCase().trim();
  
  // First filter the PRs
  const filteredPRs = prs.filter((pr) => {
    // Filter out drafts if not showing them
    if (pr.draft && !showDrafts) {
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
    // First prioritize PRs where the current user is requested as a reviewer if enabled
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
  showDrafts: boolean
): PullRequest[] => {
  return filterAndSortPRs(
    prs,
    {
      searchQuery: query,
      repositories: [],
      authors: [],
      hideStale: true,
      sortBy: 'updated',
      prioritizeMyReviews: true
    },
    showDrafts
  );
};