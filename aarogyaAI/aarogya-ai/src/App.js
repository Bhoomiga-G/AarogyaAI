import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MuiLink from '@mui/material/Link';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { teal } from '@mui/material/colors';
import { I18nextProvider } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Home from './components/Home';

// A wrapper to check if user is authenticated
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('currentUser');
  return isAuthenticated ? children : <Login />;
};

const theme = createTheme({
  palette: {
    primary: teal,
    mode: 'light',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

const AppContent = () => {
  const { t } = useTranslation();
  const location = useLocation();
  
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppBar position="static">
          <Toolbar>
            <MedicalServicesIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <MuiLink component={Link} to="/" color="inherit" underline="none">
                Aarogya AI
              </MuiLink>
            </Typography>
            
            {isAuthPage && (
              <Box>
                {location.pathname !== '/login' && (
                  <Button color="inherit" component={Link} to="/login">
                    {t('login')}
                  </Button>
                )}
                {location.pathname !== '/register' && (
                  <Button color="inherit" component={Link} to="/register">
                    {t('register')}
                  </Button>
                )}
              </Box>
            )}
          </Toolbar>
        </AppBar>
        
        <Container component="main" sx={{ flex: 1, py: 4 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              } 
            />
          </Routes>
        </Container>
        
        <Box component="footer" sx={{ py: 3, mt: 'auto', backgroundColor: (theme) => 
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Aarogya AI. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
        <AppContent />
      </Router>
    </I18nextProvider>
  );
}

export default App;
