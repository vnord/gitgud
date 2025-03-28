import { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
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
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  SortByAlpha as SortIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { PullRequest } from '../types';

export type SortOption = 'newest' | 'oldest' | 'updated' | 'title';

export interface FilterOptions {
  searchQuery: string;
  repositories: string[];
  authors: string[];
  showStale: boolean;
  sortBy: SortOption;
}

interface PRFiltersProps {
  pullRequests: PullRequest[];
  onChange: (options: FilterOptions) => void;
  options: FilterOptions;
}

export const PRFilters = ({ pullRequests, onChange, options }: PRFiltersProps) => {
  const [expandedFilters, setExpandedFilters] = useState(false);
  
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
  
  // Handle stale toggle change
  const handleStaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...options,
      showStale: event.target.checked,
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
      showStale: false,
      sortBy: 'updated',
    });
  };
  
  // Calculate active filter count
  const activeFilterCount = (
    (options.searchQuery ? 1 : 0) +
    options.repositories.length +
    options.authors.length +
    (options.showStale ? 1 : 0)
  );
  
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
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
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setExpandedFilters(!expandedFilters)}
                  size="small"
                  color={activeFilterCount > 0 ? "primary" : "default"}
                >
                  {expandedFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  <FilterIcon />
                  {activeFilterCount > 0 && (
                    <Chip 
                      label={activeFilterCount} 
                      size="small" 
                      color="primary"
                      sx={{ ml: 0.5, height: 18, fontSize: '0.7rem' }}
                    />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
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
              value={options.repositories}
              onChange={handleRepoChange}
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
          justifyContent: 'space-between', 
          alignItems: 'center',
          pt: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
          <FormControlLabel
            control={
              <Switch
                checked={options.showStale}
                onChange={handleStaleChange}
                size="small"
              />
            }
            label="Show stale PRs only"
          />
          
          <Button 
            variant="text" 
            onClick={resetFilters}
            size="small"
            disabled={activeFilterCount === 0}
          >
            Reset Filters
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
};