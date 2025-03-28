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
 * Filters PRs based on search query (title, author, repo)
 */
export const filterPRs = (
  prs: PullRequest[],
  query: string,
  showDrafts: boolean
): PullRequest[] => {
  const normalizedQuery = query.toLowerCase().trim();
  
  return prs.filter((pr) => {
    // Filter out drafts if not showing them
    if (pr.draft && !showDrafts) {
      return false;
    }
    
    // If no search query, include all PRs
    if (!normalizedQuery) {
      return true;
    }
    
    // Search in title, author login, or repository name
    return (
      pr.title.toLowerCase().includes(normalizedQuery) ||
      pr.user.login.toLowerCase().includes(normalizedQuery) ||
      pr.repository.name.toLowerCase().includes(normalizedQuery)
    );
  });
};