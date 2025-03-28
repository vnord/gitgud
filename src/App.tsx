import { useState, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ConfigProvider } from './context/ConfigContext';
import { AppHeader } from './components/AppHeader';
import { PRDashboard } from './components/PRDashboard';
import { LoginScreen } from './components/LoginScreen';
import { ConfigScreen } from './components/ConfigScreen';

// Main App Component wrapped with providers
function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <AppContent />
      </ConfigProvider>
    </AuthProvider>
  );
}

// App content that uses the context providers
function AppContent() {
  const { token, setToken } = useAuth();
  const [isConfigured, setIsConfigured] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Check if app is configured on mount
  useEffect(() => {
    const config = localStorage.getItem('app_config');
    if (config) {
      try {
        const parsedConfig = JSON.parse(config);
        if (
          parsedConfig.repositories &&
          parsedConfig.repositories.length > 0
        ) {
          setIsConfigured(true);
        }
      } catch (e) {
        console.error('Error parsing config:', e);
      }
    }
  }, []);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleLogin = (token: string) => {
    setToken(token);
  };
  
  const handleConfigClick = () => {
    setShowSettings(true);
  };
  
  const handleConfigComplete = () => {
    setIsConfigured(true);
    setShowSettings(false);
    setRefreshKey((prev) => prev + 1); // Refresh after config changes
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader 
        onRefresh={isConfigured && !showSettings ? handleRefresh : undefined} 
        onConfigClick={handleConfigClick}
      />
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        {!token ? (
          <LoginScreen onLogin={handleLogin} />
        ) : !isConfigured || showSettings ? (
          <ConfigScreen onComplete={handleConfigComplete} />
        ) : (
          <PRDashboard key={refreshKey} />
        )}
      </Container>
    </Box>
  );
}

export default App;