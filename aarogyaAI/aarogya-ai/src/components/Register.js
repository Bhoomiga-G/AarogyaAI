import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Link as MuiLink,
  Alert,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { addUser } from '../utils/localStorage';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('nameRequired');
    }
    
    if (!formData.email) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('emailInvalid');
    }
    
    if (!formData.phone) {
      newErrors.phone = t('phoneRequired');
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = t('phoneInvalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('passwordLength');
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordsDontMatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const { confirmPassword, ...userData } = formData;
    const result = addUser(userData);
    
    if (result.success) {
      setSubmitStatus({
        type: 'success',
        message: t('registrationSuccess')
      });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setSubmitStatus({
        type: 'error',
        message: result.message || t('registrationFailed')
      });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          {t('createAccount')}
        </Typography>
        
        {submitStatus.message && (
          <Alert 
            severity={submitStatus.type} 
            sx={{ mb: 2 }}
            onClose={() => setSubmitStatus({})}
          >
            {submitStatus.message}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label={t('fullName')}
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('emailAddress')}
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="phone"
            label={t('phoneNumber')}
            name="phone"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
            error={!!errors.phone}
            helperText={errors.phone}
          />
          
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel htmlFor="password">{t('password')} *</InputLabel>
            <OutlinedInput
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label={t('password')}
            />
            {errors.password && (
              <Typography variant="caption" color="error">
                {errors.password}
              </Typography>
            )}
          </FormControl>
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label={t('confirmPassword')}
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {t('register')}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <MuiLink component={Link} to="/login" variant="body2">
              {t('alreadyHaveAccount')} {t('login')}
            </MuiLink>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
