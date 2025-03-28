import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  CircularProgress,
  Switch,
  FormControlLabel,
  Slider,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Repository } from '../types';
import { fetchOrganizationRepos } from '../services/githubService';

interface ConfigScreenProps {
  onComplete: () => void;
}

export const ConfigScreen = ({ onComplete }: ConfigScreenProps) => {
  const { token } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDrafts, setShowDrafts] = useState(false);
  const [staleThresholdDays, setStaleThresholdDays] = useState(7);

  const handleOrgSearch = async () => {
    if (!orgName.trim() || !token) return;
    
    setLoading(true);
    setError('');
    
    try {
      const repos = await fetchOrganizationRepos(token, orgName);
      setRepositories(repos);
    } catch (err) {
      console.error(err);
      setError('Error fetching repositories. Please check the organization name.');
    } finally {
      setLoading(false);
    }
  };

  const handleRepoSelect = (event: SelectChangeEvent<number[]>) => {
    const selectedIds = event.target.value as number[];
    const newSelectedRepos = repositories.filter((repo) => selectedIds.includes(repo.id));
    setSelectedRepos(newSelectedRepos);
  };

  const handleSaveConfig = () => {
    // Save configuration to localStorage
    const config = {
      organizationName: orgName,
      repositories: selectedRepos,
      showDrafts,
      staleThresholdDays,
    };
    
    localStorage.setItem('app_config', JSON.stringify(config));
    onComplete();
  };

  // Load saved config on initial render
  useEffect(() => {
    const savedConfig = localStorage.getItem('app_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setOrgName(config.organizationName || '');
        setSelectedRepos(config.repositories || []);
        setShowDrafts(config.showDrafts || false);
        setStaleThresholdDays(config.staleThresholdDays || 7);
        
        if (config.organizationName) {
          handleOrgSearch();
        }
      } catch (e) {
        console.error('Error parsing saved config:', e);
      }
    }
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Card sx={{ maxWidth: 800, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
            Dashboard Configuration
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
              Organization
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="GitHub Organization Name"
                variant="outlined"
                fullWidth
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={handleOrgSearch}
                disabled={loading || !orgName.trim()}
                sx={{ minWidth: 120 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Box>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
              Repositories
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel id="repo-select-label">Select Repositories</InputLabel>
              <Select
                labelId="repo-select-label"
                multiple
                value={selectedRepos.map((repo) => repo.id)}
                onChange={handleRepoSelect}
                renderValue={() => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedRepos.map((repo) => (
                      <Chip key={repo.id} label={repo.name} />
                    ))}
                  </Box>
                )}
              >
                {repositories.map((repo) => (
                  <MenuItem key={repo.id} value={repo.id}>
                    {repo.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
              Display Options
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={showDrafts}
                  onChange={(e) => setShowDrafts(e.target.checked)}
                />
              }
              label="Show Draft PRs"
              sx={{ mb: 2, display: 'block' }}
            />
            
            <Typography gutterBottom>
              Stale PR Threshold (days): {staleThresholdDays}
            </Typography>
            <Slider
              value={staleThresholdDays}
              onChange={(_, value) => setStaleThresholdDays(value as number)}
              step={1}
              marks
              min={1}
              max={14}
              valueLabelDisplay="auto"
            />
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSaveConfig}
            disabled={selectedRepos.length === 0}
            sx={{ py: 1.5 }}
          >
            Save and Continue
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};