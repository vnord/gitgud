import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onLogin: (token: string) => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const { login } = useAuth();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Please enter a GitHub Personal Access Token');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const success = await login(token);
      
      if (success) {
        onLogin(token);
      } else {
        setError('Invalid token. Please check your token and try again.');
      }
    } catch (err) {
      setError('An error occurred while validating your token.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
      }}
    >
      <Card sx={{ maxWidth: 600, width: '100%', mb: 4 }}>
        <CardContent>
          <Typography variant="h4" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
            Welcome to GitGud PR Dashboard
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4 }}>
            GitGud is a lightweight dashboard for GitHub pull requests, designed to give you a quick overview
            of PR status across your repositories.
          </Typography>
          
          <form onSubmit={handleSubmit}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Connect to GitHub
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              label="GitHub Personal Access Token"
              variant="outlined"
              fullWidth
              value={token}
              onChange={(e) => setToken(e.target.value)}
              sx={{ mb: 2 }}
              type="password"
              required
            />
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You need a token with <code>repo</code> scope for private repositories or{' '}
              <code>public_repo</code> for public repositories.{' '}
              <Link
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noopener noreferrer"
              >
                Create a token
              </Link>
            </Typography>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Connect to GitHub'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};