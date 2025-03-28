import { Box, Grid } from '@mui/material';
import { PullRequest } from '../types';
import { PRCard } from './PRCard';

interface PRListProps {
  pullRequests: PullRequest[];
}

export const PRList = ({ pullRequests }: PRListProps) => {
  return (
    <Box>
      <Grid container spacing={2}>
        {pullRequests.map((pr) => (
          <Grid item xs={12} key={pr.id}>
            <PRCard pullRequest={pr} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};