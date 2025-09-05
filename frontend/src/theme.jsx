import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export const ColorModeContext = React.createContext({
  mode: 'dark',
  toggleColorMode: () => { }
});

export function getDesignTokens(mode = 'dark') {
  const isDark = mode === 'dark';
  return {
    palette: {
      mode,
      primary: { main: isDark ? '#13364b' : '#15659c' },
      secondary: { main: isDark ? '#4cc3fa' : '#1271e0' },
      background: {
        default: isDark ? '#07131d' : '#f5f9fc',
        paper: isDark ? '#0f1f2c' : '#ffffff'
      }
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Inter","Roboto","Helvetica","Arial",sans-serif',
      h6: { fontWeight: 600 }
    },
    components: {
      MuiAppBar: {
        styleOverrides: { root: { backdropFilter: 'blur(8px)' } }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: isDark
              ? 'linear-gradient(180deg,#0d2533,#071621)'
              : 'linear-gradient(180deg,#ffffff,#e9f3fa)',
            borderRight: isDark ? '1px solid #16394b' : '1px solid #d9e3ea'
          }
        }
      }
    }
  };
}

export function ColorModeProvider({ children }) {
  const [mode, setMode] = React.useState(() => {
    const saved = localStorage.getItem('qt_color_mode');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  const toggleColorMode = React.useCallback(() => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('qt_color_mode', next);
      return next;
    });
  }, []);

  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}