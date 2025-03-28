import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  Autocomplete,
  Chip,
  FormControlLabel,
  Switch,
  Paper,
  Collapse,
  Button,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Grid,
  Menu,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  SortByAlpha as SortIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { PullRequest } from '../types';

export type SortOption = 'newest' | 'oldest' | 'updated' | 'title';

// Import the FilterOptions type from prUtils instead of redefining it
import { FilterOptions, getRepoColor } from '../utils/prUtils';

interface PRFiltersProps {
  pullRequests: PullRequest[];
  onChange: (options: FilterOptions) => void;
  options: FilterOptions;
}

export const PRFilters = ({ pullRequests, onChange, options }: PRFiltersProps) => {
  const [expandedFilters, setExpandedFilters] = useState(() => {
    return localStorage.getItem('filters_expanded') === 'true';
  });
  
  // Add state for view options menu
  const [viewMenuAnchor, setViewMenuAnchor] = useState<null | HTMLElement>(null);
  const isViewMenuOpen = Boolean(viewMenuAnchor);
  
  const handleViewMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setViewMenuAnchor(event.currentTarget);
  };
  
  const handleViewMenuClose = () => {
    setViewMenuAnchor(null);
  };
  
  // Load saved filter state from localStorage on initial render
  useEffect(() => {
    const savedFilters = localStorage.getItem('pr_filters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        onChange(parsedFilters);
      } catch (e) {
        console.error('Error parsing saved filters:', e);
      }
    }
  }, [onChange]);
  
  // Save filter state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pr_filters', JSON.stringify(options));
  }, [options]);
  
  // Extract unique repositories and authors from PRs
  const uniqueRepos = Array.from(new Set(pullRequests.map(pr => pr.repository.name)));
  const uniqueAuthors = Array.from(new Set(pullRequests.map(pr => pr.user.login)));
  
  // Handle search query change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...options,
      searchQuery: event.target.value,
    });
  };
  
  // Handle repository selection change
  const handleRepoChange = (_: any, values: string[]) => {
    onChange({
      ...options,
      repositories: values,
    });
  };
  
  // Handle author selection change
  const handleAuthorChange = (_: any, values: string[]) => {
    onChange({
      ...options,
      authors: values,
    });
  };
  
  
  // Handle sort option change
  const handleSortChange = (event: SelectChangeEvent<SortOption>) => {
    onChange({
      ...options,
      sortBy: event.target.value as SortOption,
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    onChange({
      searchQuery: '',
      repositories: [],
      authors: [],
      hideStale: true,
      showDrafts: false,
      sortBy: 'updated',
      prioritizeMyReviews: true,
    });
  };
  
  // Calculate active filter count (only considering search, repos, and authors)
  const activeFilterCount = (
    (options.searchQuery ? 1 : 0) +
    options.repositories.length +
    options.authors.length
  );
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          sx={{ flexGrow: 1 }}
          placeholder="Search by title, author, or repository..."
          variant="outlined"
          value={options.searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
        
        <Box sx={{ display: 'flex', gap: 1, height: 40 }}>
          {/* Sort dropdown */}
          <FormControl 
            variant="outlined" 
            size="small"
            sx={{ 
              width: 120,
              '.MuiOutlinedInput-root': {
                height: '100%'
              }
            }}
          >
            <Select
              value={options.sortBy}
              onChange={handleSortChange}
              displayEmpty
              startAdornment={<SortIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="updated">Recent</MenuItem>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
              <MenuItem value="title">Name</MenuItem>
            </Select>
          </FormControl>
          
          {/* Filter button */}
          <Button
            variant="outlined"
            color={activeFilterCount > 0 ? "primary" : "inherit"}
            startIcon={<FilterIcon />}
            endIcon={expandedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => {
              const newState = !expandedFilters;
              setExpandedFilters(newState);
              localStorage.setItem('filters_expanded', newState.toString());
            }}
            aria-label="Filter PRs"
            sx={{ 
              minWidth: 0, 
              padding: activeFilterCount > 0 ? '0 10px 0 12px' : '0 12px',
              height: '100%',
              borderColor: activeFilterCount > 0 ? 'primary.main' : 'divider',
              '&:hover': {
                borderColor: activeFilterCount > 0 ? 'primary.dark' : undefined
              }
            }}
          >
            Filter
            {activeFilterCount > 0 && (
              <Box
                sx={{
                  ml: 0.75,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                {activeFilterCount}
              </Box>
            )}
          </Button>
          
          {/* View options menu button */}
          <Button
            variant="outlined"
            color={
              !options.hideStale || options.showDrafts || !options.prioritizeMyReviews 
                ? "primary" 
                : "inherit"
            }
            startIcon={<VisibilityIcon />}
            onClick={handleViewMenuOpen}
            aria-haspopup="true"
            aria-expanded={isViewMenuOpen ? 'true' : undefined}
            aria-label="View settings"
            sx={{ 
              minWidth: 0, 
              width: 100,
              height: '100%',
              borderColor: (!options.hideStale || options.showDrafts || !options.prioritizeMyReviews) ? 'primary.main' : 'divider',
              '&:hover': {
                borderColor: (!options.hideStale || options.showDrafts || !options.prioritizeMyReviews) ? 'primary.dark' : undefined
              }
            }}
          >
            View
          </Button>
        </Box>
        
        {/* View options menu */}
        <Menu
          anchorEl={viewMenuAnchor}
          open={isViewMenuOpen}
          onClose={handleViewMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            elevation: 2,
            sx: { 
              mt: 0.5, 
              width: 260,
              border: '1px solid',
              borderColor: 'divider'
            }
          }}
        >
          <Box sx={{ 
            px: 2, 
            py: 1, 
            bgcolor: 'background.default', 
            borderBottom: '1px solid', 
            borderColor: 'divider'
          }}>
            <Typography variant="subtitle2" color="text.secondary">
              Display Preferences
            </Typography>
          </Box>
          
          <MenuItem 
            dense
            onClick={() => {
              onChange({...options, hideStale: !options.hideStale});
            }}
          >
            <FormControlLabel
              control={
                <Switch 
                  checked={options.hideStale} 
                  size="small" 
                  onChange={(e) => {
                    e.stopPropagation();
                    onChange({...options, hideStale: e.target.checked});
                  }}
                />
              }
              label="Hide stale PRs"
              sx={{ m: 0 }}
            />
          </MenuItem>
          
          <MenuItem 
            dense
            onClick={() => {
              onChange({...options, showDrafts: !options.showDrafts});
            }}
          >
            <FormControlLabel
              control={
                <Switch 
                  checked={options.showDrafts} 
                  size="small" 
                  onChange={(e) => {
                    e.stopPropagation();
                    onChange({...options, showDrafts: e.target.checked});
                  }}
                />
              }
              label="Show draft PRs"
              sx={{ m: 0 }}
            />
          </MenuItem>
          
          <MenuItem 
            dense
            onClick={() => {
              onChange({...options, prioritizeMyReviews: !options.prioritizeMyReviews});
            }}
          >
            <FormControlLabel
              control={
                <Switch 
                  checked={options.prioritizeMyReviews} 
                  size="small" 
                  onChange={(e) => {
                    e.stopPropagation();
                    onChange({...options, prioritizeMyReviews: e.target.checked});
                  }}
                />
              }
              label="Prioritize my review requests"
              sx={{ m: 0 }}
            />
          </MenuItem>
        </Menu>
      </Box>
      
      <Collapse in={expandedFilters}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              multiple
              options={uniqueRepos.sort()}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Filter by Repository"
                  placeholder="Select repositories"
                  size="small"
                />
              )}
              renderOption={(props, option) => {
                const repoColors = getRepoColor(option);
                return (
                  <li {...props}>
                    <Box 
                      component="span" 
                      sx={{ 
                        width: 14, 
                        height: 14, 
                        borderRadius: '50%', 
                        mr: 1, 
                        display: 'inline-block',
                        backgroundColor: repoColors.bg,
                        border: `1px solid ${repoColors.text}`
                      }} 
                    />
                    {option}
                  </li>
                );
              }}
              value={options.repositories}
              onChange={handleRepoChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const repoColors = getRepoColor(option);
                  return (
                    <Chip
                      label={option}
                      size="small"
                      icon={<CodeIcon />}
                      sx={{
                        bgcolor: repoColors.bg,
                        color: repoColors.text,
                        borderColor: repoColors.text,
                        '& .MuiChip-icon': {
                          color: repoColors.text
                        }
                      }}
                      {...getTagProps({ index })}
                    />
                  );
                })
              }
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Autocomplete
              multiple
              options={uniqueAuthors.sort()}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Filter by Author"
                  placeholder="Select authors"
                  size="small"
                />
              )}
              value={options.authors}
              onChange={handleAuthorChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    size="small"
                    {...getTagProps({ index })}
                  />
                ))
              }
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="sort-select-label">Sort By</InputLabel>
              <Select
                labelId="sort-select-label"
                value={options.sortBy}
                label="Sort By"
                onChange={handleSortChange}
                startAdornment={<SortIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="updated">Recently Updated</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="title">Alphabetical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center',
          pt: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
          <Button 
            variant="outlined" 
            onClick={resetFilters}
            size="small"
            disabled={activeFilterCount === 0}
            color="inherit"
            startIcon={<FilterIcon fontSize="small" />}
            sx={{
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'rgba(0, 0, 0, 0.25)'
              }
            }}
          >
            Reset Filters
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
};