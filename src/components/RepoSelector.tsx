import { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Avatar,
  Divider,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  ForkRight as ForkIcon,
  Check as CheckIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { Repository } from '../types';

interface RepoSelectorProps {
  repositories: Repository[];
  selectedRepos: Repository[];
  onChange: (repos: Repository[]) => void;
}

type SortOption = 'name' | 'updated' | 'stars' | 'forks';

export const RepoSelector = ({ repositories, selectedRepos, onChange }: RepoSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  
  // Check if a repository is selected
  const isSelected = (repo: Repository) => {
    return selectedRepos.some(selected => selected.id === repo.id);
  };
  
  // Toggle selection of a repository
  const toggleRepo = (repo: Repository) => {
    if (isSelected(repo)) {
      onChange(selectedRepos.filter(r => r.id !== repo.id));
    } else {
      onChange([...selectedRepos, repo]);
    }
  };
  
  // Select all repositories
  const selectAll = () => {
    onChange(repositories);
  };
  
  // Deselect all repositories
  const deselectAll = () => {
    onChange([]);
  };
  
  // Handle sort change
  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    setSortBy(event.target.value as SortOption);
  };
  
  // Filter and sort repositories
  const filteredAndSortedRepos = useMemo(() => {
    let filtered = repositories;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = repositories.filter(repo => 
        repo.name.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query) ||
        repo.full_name.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
          return (b.updated_at || '') > (a.updated_at || '') ? 1 : -1;
        case 'stars':
          return (b.stars || 0) - (a.stars || 0);
        case 'forks':
          return (b.forks || 0) - (a.forks || 0);
        default:
          return 0;
      }
    });
  }, [repositories, searchQuery, sortBy]);
  
  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="sort-select-label">Sort By</InputLabel>
          <Select
            labelId="sort-select-label"
            value={sortBy}
            label="Sort By"
            onChange={handleSortChange}
            startAdornment={<SortIcon fontSize="small" sx={{ mr: 1 }} />}
          >
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="updated">Recently Updated</MenuItem>
            <MenuItem value="stars">Stars</MenuItem>
            <MenuItem value="forks">Forks</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedRepos.length === repositories.length && repositories.length > 0}
                indeterminate={selectedRepos.length > 0 && selectedRepos.length < repositories.length}
                onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                disabled={repositories.length === 0}
              />
            }
            label="Select All"
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          {selectedRepos.length} of {repositories.length} repositories selected
        </Typography>
      </Box>
      
      <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
        <List disablePadding>
          {filteredAndSortedRepos.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary="No repositories found" 
                secondary={searchQuery ? "Try adjusting your search query" : "Add repositories to your organization"} 
              />
            </ListItem>
          ) : (
            filteredAndSortedRepos.map((repo, index) => (
              <Box key={repo.id}>
                {index > 0 && <Divider />}
                <ListItemButton 
                  selected={isSelected(repo)}
                  onClick={() => toggleRepo(repo)}
                  sx={{ 
                    py: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(45, 164, 78, 0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(45, 164, 78, 0.12)',
                      },
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 50 }}>
                    <Checkbox 
                      checked={isSelected(repo)} 
                      edge="start"
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          src={repo.owner.avatar_url} 
                          sx={{ width: 20, height: 20, mr: 1 }} 
                          alt={repo.owner.login}
                        />
                        <Typography variant="body1" component="span" fontWeight={500}>
                          {repo.name}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span" color="text.secondary" noWrap>
                          {repo.description || "No description"}
                        </Typography>
                        <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {repo.stars !== undefined && repo.stars > 0 && (
                            <Chip 
                              icon={<StarIcon fontSize="small" />} 
                              label={repo.stars} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                          {repo.forks !== undefined && repo.forks > 0 && (
                            <Chip 
                              icon={<ForkIcon fontSize="small" />} 
                              label={repo.forks} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                          {repo.updated_at && (
                            <Chip 
                              label={`Updated ${formatDistanceToNow(new Date(repo.updated_at))} ago`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </>
                    }
                  />
                  
                  {isSelected(repo) && (
                    <Tooltip title="Selected">
                      <IconButton edge="end" color="primary" size="small">
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </ListItemButton>
              </Box>
            ))
          )}
        </List>
      </Paper>
      
      {selectedRepos.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Repositories:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedRepos.map((repo) => (
              <Chip
                key={repo.id}
                label={repo.name}
                onDelete={() => toggleRepo(repo)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};