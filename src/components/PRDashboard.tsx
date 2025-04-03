import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  LinearProgress,
  Grid,
  Tabs,
  Tab,
  Paper,
  useTheme,
  Chip,
} from '@mui/material';
import { FilterAlt as FilterIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../context/ConfigContext';
import { PullRequest, ReviewState } from '../types';
import { fetchAllPRs, markRequestedReviewerPRs } from '../services/githubService';
import { 
  groupPRsByStatus, 
  filterAndSortPRs, 
  FilterOptions, 
  getRepoColor,
  applyPinStatus,
  togglePinPR
} from '../utils/prUtils';
import { PRList } from './PRList';
import { PRFilters } from './PRFilters';

export const PRDashboard = () => {
  const { token } = useAuth();
  const { config } = useConfig();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allPRs, setAllPRs] = useState<PullRequest[]>([]);
  const [filteredPRs, setFilteredPRs] = useState<PullRequest[]>([]);
  const [activeTab, setActiveTab] = useState<ReviewState>(() => {
    const savedTab = localStorage.getItem('active_pr_tab');
    return (savedTab as ReviewState) || 'NEEDS_REVIEW';
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(() => {
    // Get prioritizeMyReviews from config
    const config = localStorage.getItem('app_config');
    let prioritizeMyReviews = true;
    if (config) {
      try {
        const configObj = JSON.parse(config);
        prioritizeMyReviews = configObj.prioritizeMyReviews !== undefined 
          ? configObj.prioritizeMyReviews 
          : true;
      } catch (e) {
        console.error('Error parsing config:', e);
      }
    }

    // Try to get saved filters
    const savedFilters = localStorage.getItem('pr_filters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        // Override prioritizeMyReviews with the config value
        return { ...filters, prioritizeMyReviews };
      } catch (e) {
        console.error('Error parsing saved filters:', e);
      }
    }
    
    // Default filter options if none are saved
    return {
      searchQuery: '',
      repositories: [],
      authors: [],
      hideStale: true,
      sortBy: 'updated',
      prioritizeMyReviews
    };
  });

  // Get config from localStorage
  const getConfig = () => {
    const savedConfig = localStorage.getItem('app_config');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    return null;
  };

  const fetchPRs = async () => {
    if (!token) return;
    
    const config = getConfig();
    if (!config || !config.repositories || config.repositories.length === 0) {
      setError('No repositories configured. Please update your configuration.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Fetch PRs from all configured repositories
      let prs = await fetchAllPRs(
        token,
        config.repositories,
        config.staleThresholdDays || 7
      );
      
      // Mark PRs where the current user is requested as a reviewer
      prs = await markRequestedReviewerPRs(token, prs);
      
      // Apply pin status from localStorage
      prs = applyPinStatus(prs);
      
      setAllPRs(prs);
    } catch (err) {
      console.error(err);
      setError('Error fetching pull requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch PRs on component mount and refresh every 5 minutes
  useEffect(() => {
    fetchPRs();
    
    // Set up periodic refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchPRs();
    }, 5 * 60 * 1000);
    
    // Clear interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [token]);

  // Filter PRs whenever filter options or PR list changes
  useEffect(() => {
    setFilteredPRs(filterAndSortPRs(allPRs, filterOptions));
  }, [allPRs, filterOptions]);
  
  // Update prioritizeMyReviews when config changes
  useEffect(() => {
    if (config && config.prioritizeMyReviews !== undefined && 
        config.prioritizeMyReviews !== filterOptions.prioritizeMyReviews) {
      setFilterOptions(prev => ({
        ...prev,
        prioritizeMyReviews: config.prioritizeMyReviews
      }));
    }
  }, [config]);

  // Handle filter changes
  const handleFilterChange = (newOptions: FilterOptions) => {
    setFilterOptions(newOptions);
    // Also save to localStorage when filters change
    localStorage.setItem('pr_filters', JSON.stringify(newOptions));
  };

  // Group PRs by status
  const groupedPRs = groupPRsByStatus(filteredPRs);

  const handleTabChange = (_: React.SyntheticEvent, newValue: ReviewState) => {
    setActiveTab(newValue);
    localStorage.setItem('active_pr_tab', newValue);
  };

  const getStatusCount = (status: ReviewState) => {
    return groupedPRs[status]?.length || 0;
  };
  
  // Handle toggling pin status for a PR
  const handlePinToggle = (prId: string) => {
    // Update localStorage
    const isPinned = togglePinPR(prId);
    
    // Update the PR in our state
    setAllPRs(prevPRs => 
      prevPRs.map(pr => 
        pr.id === prId ? { ...pr, isPinned } : pr
      )
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      {loading && <LinearProgress />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <PRFilters 
        pullRequests={allPRs}
        onChange={handleFilterChange}
        options={filterOptions}
      />
      
      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            label={`Needs Review (${getStatusCount('NEEDS_REVIEW')})`} 
            value="NEEDS_REVIEW"
            sx={{ 
              color: activeTab === 'NEEDS_REVIEW' ? theme.palette.info.main : undefined 
            }}
          />
          <Tab 
            label={`Changes Requested (${getStatusCount('CHANGES_REQUESTED')})`} 
            value="CHANGES_REQUESTED"
            sx={{ 
              color: activeTab === 'CHANGES_REQUESTED' ? theme.palette.error.main : undefined 
            }}
          />
          <Tab 
            label={`Approved (${getStatusCount('APPROVED')})`} 
            value="APPROVED"
            sx={{ 
              color: activeTab === 'APPROVED' ? theme.palette.success.main : undefined 
            }}
          />
          <Tab 
            label={`Draft (${getStatusCount('DRAFT')})`} 
            value="DRAFT"
            sx={{ 
              color: activeTab === 'DRAFT' ? theme.palette.warning.main : undefined 
            }}
          />
        </Tabs>
      </Paper>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {groupedPRs[activeTab]?.length || 0} of {filteredPRs.length} filtered pull requests
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {filterOptions.repositories.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                icon={<FilterIcon fontSize="small" />} 
                label={`${filterOptions.repositories.length} repos`} 
                size="small"
                variant="outlined"
                color="primary"
              />
              <Box sx={{ display: 'flex', ml: 1, gap: 0.5 }}>
                {filterOptions.repositories.slice(0, 3).map(repo => {
                  const repoColors = getRepoColor(repo);
                  return (
                    <Box 
                      key={repo}
                      component="span" 
                      sx={{ 
                        width: 14, 
                        height: 14, 
                        borderRadius: '50%', 
                        display: 'inline-block',
                        backgroundColor: repoColors.bg,
                        border: `1px solid ${repoColors.text}`,
                        position: 'relative',
                        '&:hover::after': {
                          content: `"${repo}"`,
                          position: 'absolute',
                          bottom: '120%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          whiteSpace: 'nowrap',
                          zIndex: 1
                        }
                      }} 
                    />
                  );
                })}
                {filterOptions.repositories.length > 3 && (
                  <Box 
                    component="span" 
                    sx={{ 
                      width: 14, 
                      height: 14, 
                      borderRadius: '50%', 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      fontSize: '8px',
                      color: 'text.secondary'
                    }} 
                  >
                    +{filterOptions.repositories.length - 3}
                  </Box>
                )}
              </Box>
            </Box>
          )}
          
          {filterOptions.authors.length > 0 && (
            <Chip 
              icon={<FilterIcon fontSize="small" />} 
              label={`${filterOptions.authors.length} authors`} 
              size="small"
              variant="outlined"
              color="primary"
            />
          )}
          
          {!filterOptions.hideStale && (
            <Chip 
              icon={<FilterIcon fontSize="small" />} 
              label="Including stale PRs" 
              size="small"
              variant="outlined"
              color="warning"
            />
          )}
          
          {!filterOptions.prioritizeMyReviews && (
            <Chip 
              icon={<FilterIcon fontSize="small" />} 
              label="Not prioritizing review requests" 
              size="small"
              variant="outlined"
              color="info"
            />
          )}
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {groupedPRs[activeTab]?.length === 0 && !loading ? (
            <Typography variant="body1" textAlign="center" sx={{ py: 4 }}>
              No pull requests found. Try adjusting your filters or configuration.
            </Typography>
          ) : (
            <PRList pullRequests={groupedPRs[activeTab] || []} onPinToggle={handlePinToggle} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};