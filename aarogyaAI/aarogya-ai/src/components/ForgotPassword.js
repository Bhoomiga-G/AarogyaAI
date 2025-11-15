import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { findUserByEmail, updatePassword } from '../utils/localStorage';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({});

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    
    if (!email) {
      setErrors({ email: t('emailRequired') });
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ email: t('emailInvalid') });
      return;
    }
    
    const user = findUserByEmail(email);
    if (!user) {
      setErrors({ email: t('emailNotFound') });
      return;
    }
    
    setStep(2);
    setErrors({});
  };

  const validatePassword = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = t('passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('passwordLength');
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('passwordsDontMatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    const result = updatePassword(email, password);
    
    if (result.success) {
      setSubmitStatus({
        type: 'success',
        message: t('passwordResetSuccess')
      });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setSubmitStatus({
        type: 'error',
        message: result.message || t('passwordResetFailed')
      });
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          {t('forgotPassword')}
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
        
        {step === 1 ? (
          <Box component="form" onSubmit={handleEmailSubmit} sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {t('enterEmailForReset')}
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('emailAddress')}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              error={!!errors.email}
              helperText={errors.email}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {t('continue')}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <MuiLink component="button" type="button" onClick={() => navigate('/login')} variant="body2">
                {t('backToLogin')}
              </MuiLink>
            </Box>
          </Box>
        ) : (
          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              {t('enterNewPassword')}
            </Typography>
            
            <FormControl fullWidth margin="normal" variant="outlined">
              <InputLabel htmlFor="password">{t('newPassword')} *</InputLabel>
              <OutlinedInput
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                label={t('newPassword')}
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
              label={t('confirmNewPassword')}
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {t('resetPassword')}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <MuiLink component="button" type="button" onClick={() => setStep(1)} variant="body2">
                {t('back')}
              </MuiLink>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
