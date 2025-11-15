import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';

const Login = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || 'en');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.username || !formData.password) {
      setError(t('allFieldsRequired'));
      return;
    }
    
    // In a real app, you would make an API call to verify credentials
    // For demo purposes, we'll simulate a successful login
    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('aarogya_ai_users')) || [];
      const user = users.find(u => 
        (u.email === formData.username || u.phone === formData.username) && 
        u.password === formData.password
      );
      
      if (user) {
        // Store user in localStorage (in a real app, you'd use a proper auth context/token)
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Redirect to home
        window.location.href = '/';
      } else {
        setError(t('loginError'));
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(t('loginError'));
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <FormControl variant="outlined" size="small">
              <InputLabel id="language-select-label">
                {t('selectLanguage')}
              </InputLabel>
              <Select
                labelId="language-select-label"
                value={language}
                onChange={handleLanguageChange}
                label={t('selectLanguage')}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ta">தமிழ்</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Typography component="h1" variant="h5" align="center" gutterBottom>
            {t('welcome')}
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label={t('username')}
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label={t('password')}
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
            />
            
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {t('login')}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                component={Link} 
                to="/forgot-password" 
                color="primary" 
                size="small"
                sx={{ textTransform: 'none' }}
              >
                {t('forgotPassword')}
              </Button>
              <Button 
                component={Link} 
                to="/register" 
                color="primary" 
                size="small"
                sx={{ textTransform: 'none' }}
              >
                {t('createAccount')}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
