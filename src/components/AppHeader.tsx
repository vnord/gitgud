import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import { Settings as SettingsIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AppHeaderProps {
  onRefresh?: () => void;
}

export const AppHeader = ({ onRefresh }: AppHeaderProps) => {
  const { token, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  return (
    <AppBar position="static" color="default">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <span role="img" aria-label="gitgud logo" style={{ marginRight: 8 }}>
              👍
            </span>
            GitGud PR Dashboard
          </Box>
        </Typography>
        
        {token && onRefresh && (
          <Tooltip title="Refresh">
            <IconButton 
              color="primary" 
              onClick={onRefresh}
              size="large"
              sx={{ mr: 1 }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
        
        {token && (
          <>
            <IconButton
              size="large"
              onClick={handleMenu}
              color="inherit"
            >
              <SettingsIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Settings</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};