import { Box, Grid } from '@mui/material';
import { PullRequest } from '../types';
import { PRCard } from './PRCard';

interface PRListProps {
  pullRequests: PullRequest[];
  onPinToggle?: (prId: string) => void;
}

export const PRList = ({ pullRequests, onPinToggle }: PRListProps) => {
  return (
    <Box>
      <Grid container spacing={2}>
        {pullRequests.map((pr) => (
          <Grid item xs={12} key={pr.id}>
            <PRCard pullRequest={pr} onPinToggle={onPinToggle} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};