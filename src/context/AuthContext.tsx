import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { AuthContextType } from '../types';

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  login: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('github_token'));

  // Check token validity on mount and when token changes
  useEffect(() => {
    const validateExistingToken = async () => {
      if (token) {
        try {
          const octokit = new Octokit({ auth: token });
          await octokit.users.getAuthenticated();
        } catch (error) {
          console.error('Token validation error:', error);
          // Token is invalid or expired, clear it
          localStorage.removeItem('github_token');
          setToken(null);
        }
      }
    };
    
    validateExistingToken();
  }, [token]);

  // Validate token by making a simple API call
  const login = async (newToken: string): Promise<boolean> => {
    try {
      const octokit = new Octokit({ auth: newToken });
      const { data } = await octokit.users.getAuthenticated();
      
      if (data) {
        localStorage.setItem('github_token', newToken);
        setToken(newToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('github_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};