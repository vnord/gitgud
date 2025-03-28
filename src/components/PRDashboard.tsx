import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  LinearProgress,
  TextField,
  InputAdornment,
  Grid,
  Tabs,
  Tab,
  Paper,
  useTheme,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { PullRequest, ReviewState } from '../types';
import { fetchAllPRs } from '../services/githubService';
import { groupPRsByStatus, filterPRs } from '../utils/prUtils';
import { PRList } from './PRList';

export const PRDashboard = () => {
  const { token } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [allPRs, setAllPRs] = useState<PullRequest[]>([]);
  const [filteredPRs, setFilteredPRs] = useState<PullRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ReviewState>('NEEDS_REVIEW');

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
      const prs = await fetchAllPRs(
        token,
        config.repositories,
        config.staleThresholdDays || 7
      );
      setAllPRs(prs);
    } catch (err) {
      console.error(err);
      setError('Error fetching pull requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch PRs on component mount
  useEffect(() => {
    fetchPRs();
  }, [token]);

  // Filter PRs whenever search query or PR list changes
  useEffect(() => {
    const config = getConfig();
    const showDrafts = config?.showDrafts || false;
    setFilteredPRs(filterPRs(allPRs, searchQuery, showDrafts));
  }, [allPRs, searchQuery]);

  // Group PRs by status
  const groupedPRs = groupPRsByStatus(filteredPRs);

  const handleTabChange = (_: React.SyntheticEvent, newValue: ReviewState) => {
    setActiveTab(newValue);
  };

  const getStatusCount = (status: ReviewState) => {
    return groupedPRs[status]?.length || 0;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {loading && <LinearProgress />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by title, author, or repository..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
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
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          {filteredPRs.length === 0 && !loading ? (
            <Typography variant="body1" textAlign="center" sx={{ py: 4 }}>
              No pull requests found. Try adjusting your search or configuration.
            </Typography>
          ) : (
            <PRList pullRequests={groupedPRs[activeTab] || []} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};