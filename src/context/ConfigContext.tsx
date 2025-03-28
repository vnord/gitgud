import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AppConfig, AppConfigContextType } from '../types';

// Default configuration
const DEFAULT_CONFIG: AppConfig = {
  organizationName: '',
  repositories: [],
  staleThresholdDays: 7,
};

const ConfigContext = createContext<AppConfigContextType>({
  config: null,
  setConfig: () => {},
  saveConfig: () => {},
});

export const useConfig = () => useContext(ConfigContext);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const [config, setConfig] = useState<AppConfig | null>(null);

  // Load config from localStorage on initial render
  useEffect(() => {
    const savedConfig = localStorage.getItem('app_config');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Error parsing saved config:', e);
        setConfig(DEFAULT_CONFIG);
      }
    } else {
      setConfig(DEFAULT_CONFIG);
    }
  }, []);

  const saveConfig = (newConfig: AppConfig) => {
    localStorage.setItem('app_config', JSON.stringify(newConfig));
    setConfig(newConfig);
  };

  return (
    <ConfigContext.Provider value={{ config, setConfig, saveConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};