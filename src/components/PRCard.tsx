import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Avatar,
  Link,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  AccessTime as TimeIcon,
  Code as CodeIcon,
  AssignmentTurnedIn as ReviewRequestIcon,
  PushPin as PinIcon,
  PushPinOutlined as PinOutlinedIcon,
} from '@mui/icons-material';
import { PullRequest, ReviewState } from '../types';
import { formatTimeAgo, getRepoColor } from '../utils/prUtils';

interface PRCardProps {
  pullRequest: PullRequest;
  onPinToggle?: (prId: string) => void;
}

export const PRCard = ({ pullRequest, onPinToggle }: PRCardProps) => {
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

  // Get repo color for consistent visual identification
  const repoColors = getRepoColor(pullRequest.repository.name);
  
  // Determine card styling based on pin status and review request status
  const getBorderStyle = () => {
    if (pullRequest.isPinned) {
      return {
        borderLeft: '4px solid',
        borderLeftColor: theme.palette.primary.main,
        borderTop: '1px solid',
        borderTopColor: theme.palette.primary.main,
        borderRight: '1px solid',
        borderRightColor: theme.palette.primary.main,
        borderBottom: '1px solid',
        borderBottomColor: theme.palette.primary.main,
      };
    }
    
    return {
      borderLeft: '4px solid',
      borderLeftColor: pullRequest.userIsRequestedReviewer 
        ? theme.palette.info.main 
        : repoColors.text,
    };
  };
  
  // Determine background color based on pin status and review request status
  const getBackgroundColor = () => {
    if (pullRequest.isPinned) {
      return 'rgba(25, 118, 210, 0.03)';
    }
    
    return pullRequest.userIsRequestedReviewer 
      ? 'rgba(25, 118, 210, 0.05)' 
      : `${repoColors.bg}30`; // 30 represents 19% opacity in hex
  };

  return (
    <Card 
      variant="outlined"
      sx={{ 
        ...getBorderStyle(),
        bgcolor: getBackgroundColor(),
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: pullRequest.isPinned 
            ? `0 4px 8px rgba(0, 0, 0, 0.1)` 
            : `0 0 0 1px ${repoColors.text}40`,
          transform: pullRequest.isPinned ? 'translateY(-2px)' : 'none',
        }
      }}
    >
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
              {/* Apply repository-specific color styling */}
              {(() => {
                const repoColors = getRepoColor(pullRequest.repository.name);
                return (
                  <Chip
                    size="small"
                    label={pullRequest.repository.name}
                    icon={<CodeIcon />}
                    sx={{
                      bgcolor: repoColors.bg,
                      color: repoColors.text,
                      borderColor: repoColors.text,
                      '& .MuiChip-icon': {
                        color: repoColors.text
                      }
                    }}
                  />
                );
              })()}
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
              {pullRequest.userIsRequestedReviewer && (
                <Chip
                  size="small"
                  label="Your Review Requested"
                  icon={<ReviewRequestIcon />}
                  color="info"
                  sx={{ fontWeight: 'bold' }}
                />
              )}
              {pullRequest.isPinned && (
                <Chip
                  size="small"
                  label="Pinned"
                  icon={<PinIcon fontSize="small" />}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              color: 'text.secondary',
              ml: 2,
              gap: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimeIcon fontSize="small" sx={{ mr: 0.5 }} />
              <Typography variant="body2">
                {formatTimeAgo(pullRequest.updated_at)}
              </Typography>
            </Box>
            
            {onPinToggle && (
              <Tooltip title={pullRequest.isPinned ? "Unpin this PR" : "Pin this PR"}>
                <IconButton 
                  size="small" 
                  onClick={() => onPinToggle(pullRequest.id)}
                  color={pullRequest.isPinned ? "primary" : "default"}
                  sx={{ 
                    p: 0.5,
                    transform: pullRequest.isPinned ? 'none' : 'rotate(45deg)',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      transform: 'none'
                    }
                  }}
                >
                  {pullRequest.isPinned ? <PinIcon /> : <PinOutlinedIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};