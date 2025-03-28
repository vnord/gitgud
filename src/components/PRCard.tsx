import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  Link,
  useTheme,
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  AccessTime as TimeIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { PullRequest, ReviewState } from '../types';
import { formatTimeAgo } from '../utils/prUtils';

interface PRCardProps {
  pullRequest: PullRequest;
}

export const PRCard = ({ pullRequest }: PRCardProps) => {
  const theme = useTheme();

  const getStatusColor = (status: ReviewState) => {
    switch (status) {
      case 'APPROVED':
        return theme.palette.success.main;
      case 'CHANGES_REQUESTED':
        return theme.palette.error.main;
      case 'NEEDS_REVIEW':
        return theme.palette.info.main;
      case 'DRAFT':
        return theme.palette.warning.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const getStatusLabel = (status: ReviewState) => {
    switch (status) {
      case 'APPROVED':
        return 'Approved';
      case 'CHANGES_REQUESTED':
        return 'Changes Requested';
      case 'NEEDS_REVIEW':
        return 'Needs Review';
      case 'DRAFT':
        return 'Draft';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            src={pullRequest.user.avatar_url}
            alt={pullRequest.user.login}
            sx={{ width: 32, height: 32, mr: 2 }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h2">
              <Link 
                href={pullRequest.html_url} 
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                color="inherit"
              >
                {pullRequest.title}
              </Link>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              <Chip
                size="small"
                label={pullRequest.repository.name}
                icon={<CodeIcon />}
                variant="outlined"
              />
              <Chip
                size="small"
                label={`#${pullRequest.number}`}
                variant="outlined"
              />
              <Chip
                size="small"
                label={`@${pullRequest.user.login}`}
                variant="outlined"
              />
              <Chip
                size="small"
                label={getStatusLabel(pullRequest.status || 'UNKNOWN')}
                sx={{
                  bgcolor: getStatusColor(pullRequest.status || 'UNKNOWN'),
                  color: '#fff',
                }}
              />
              {pullRequest.stale && (
                <Chip
                  size="small"
                  label="Stale"
                  icon={<ErrorIcon />}
                  color="warning"
                />
              )}
            </Box>
          </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: 'text.secondary',
              ml: 2 
            }}
          >
            <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {formatTimeAgo(pullRequest.updated_at)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};