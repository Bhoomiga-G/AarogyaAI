import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import OpenAI from 'openai';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  useMediaQuery,
  useTheme,
  CssBaseline,
  Grid,
} from '@mui/material';
import {
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  CalendarToday as CalendarIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const drawerWidth = 280;

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [openAppointment, setOpenAppointment] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    name: '',
    date: '',
    time: '',
    doctor: '',
    reason: ''
  });
  
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('appSettings');
    return savedSettings 
      ? JSON.parse(savedSettings) 
      : {
          notifications: true,
          darkMode: false,
          language: 'en',
          emailNotifications: true,
          openAIApiKey: ''
        };
  });
  
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);
  
  const [openAIDoctor, setOpenAIDoctor] = useState(false);
  const [aiDoctorInput, setAiDoctorInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I\'m your AI Doctor. How can I assist you with your health today?',
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = React.useRef(null);
  const messagesEndRef = React.useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAppointmentChange = (e) => {
    const { name, value } = e.target;
    setAppointmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsChange = (e) => {
    const { name, checked, type } = e.target;
    const value = type === 'checkbox' ? checked : e.target.value;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAppointment = (e) => {
    e.preventDefault();
    console.log('Appointment data:', appointmentData);
    setOpenAppointment(false);
  };

  const handleSubmitSettings = (e) => {
    e.preventDefault();
    console.log('Settings saved:', settings);
    setOpenSettings(false);
  };

  const analyzeImageWithGPT4Vision = async (imageData) => {
    try {
      console.log('Starting image analysis...');
      
      // Extract the base64 data and MIME type from the data URL
      const matches = imageData.match(/^data:(.+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        console.error('Invalid image data format');
        throw new Error('Invalid image format. Please try with a different image.');
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];
      
      console.log('Sending request to OpenAI Vision API...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.openAIApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                { 
                  type: 'text', 
                  text: 'Please analyze this medical image carefully. Describe any visible conditions, symptoms, or notable features in detail. Be specific about what you observe, including colors, shapes, textures, and any other relevant medical observations.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${base64Data}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Status:', response.status);
        console.error('API Error Response:', errorText);
        let errorMessage = 'Failed to analyze image';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Received response from Vision API');
      const analysis = data.choices?.[0]?.message?.content;
      
      if (!analysis) {
        console.error('No analysis content in response:', data);
        throw new Error('Received empty response from the image analysis service');
      }
      
      return analysis;
    } catch (error) {
      console.error('Error in analyzeImageWithGPT4Vision:', {
        error: error.message,
        name: error.name,
        stack: error.stack,
        imageDataLength: imageData?.length,
        imageDataType: typeof imageData,
        hasImagePrefix: imageData?.startsWith?.('data:')
      });
      return `I'm having trouble analyzing this image. ${error.message || 'Please try again or describe the issue in words.'}`;
    }
  };

  const handleAIDoctorSubmit = async (e) => {
    e.preventDefault();
    const userMessage = aiDoctorInput.trim();
    const hasImage = !!selectedFile;
    
    if (!userMessage && !hasImage) return;
    
    if (!settings.openAIApiKey) {
      alert('Please set your OpenAI API key in Settings first');
      setOpenSettings(true);
      return;
    }
    
    // Add user message to chat
    const userMessageObj = {
      id: messages.length + 1,
      text: userMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
      image: imagePreview
    };
    
    setMessages(prev => [...prev, userMessageObj]);
    setAiDoctorInput('');
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsLoading(true);
    
    try {
      const openai = new OpenAI({
        apiKey: settings.openAIApiKey,
        dangerouslyAllowBrowser: true
      });

      let imageAnalysis = '';
      
      // If there's an image, analyze it first
      if (hasImage) {
        try {
          // Show a loading message for image analysis
          const loadingMessage = {
            id: messages.length + 2,
            text: 'Analyzing your image...',
            sender: 'system',
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, loadingMessage]);
          
          // Analyze the image
          imageAnalysis = await analyzeImageWithGPT4Vision(userMessageObj.image);
          
          // Remove loading message and add analysis
          setMessages(prev => [
            ...prev.filter(msg => msg.id !== loadingMessage.id),
            {
              id: messages.length + 2,
              text: `Image analysis complete: ${imageAnalysis}`,
              sender: 'system',
              timestamp: new Date().toISOString()
            }
          ]);
        } catch (error) {
          console.error('Error analyzing image:', error);
          imageAnalysis = 'Unable to analyze the image. Please describe the issue in words.';
        }
      }
      
      // Prepare conversation history for context
      const conversationHistory = messages
        .filter(msg => msg.text && msg.text.trim() !== '')
        .map(msg => ({
          role: msg.sender === 'ai' ? 'assistant' : 'user',
          content: msg.sender === 'user' && msg.image 
            ? `${msg.text} [Attached image: ${imageAnalysis}]` 
            : msg.text
        }));
      
      // Add system message and current user message
      const messagesToSend = [
        {
          role: 'system',
          content: `You are a helpful AI doctor assistant. ${hasImage ? 'The user has shared an image. ' + imageAnalysis : ''} Provide clear, concise, and accurate medical information. Always remind users to consult with a healthcare professional for medical advice.`
        },
        ...conversationHistory,
        { 
          role: 'user', 
          content: hasImage && !userMessage 
            ? `I've shared an image. ${imageAnalysis} Can you provide more information about this?` 
            : userMessage 
        }
      ];
      
      // Use GPT-4 for better understanding of medical context
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: messagesToSend,
        max_tokens: 1000,
        temperature: 0.7,
      });
      
      let aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I am unable to provide a response at the moment.';
      
      // If we have an image but no specific question, prepend the analysis
      if (hasImage && !userMessage) {
        aiResponse = `I've analyzed the image you shared. Here's what I can observe:\n\n${imageAnalysis}\n\n${aiResponse}`;
      }
      
      // Add AI response to chat
      const aiMessageObj = {
        id: messages.length + 2,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, aiMessageObj]);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      const errorMessage = `Error: ${error.message}. Please check your API key and try again.`;
      setMessages(prev => [...prev, {
        id: messages.length + 2,
        text: errorMessage,
        sender: 'ai',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setSelectedFile(file);
    
    // Create image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNewQuestion = () => {
    setAiDoctorInput('');
    removeImage();
  };

  const user = JSON.parse(localStorage.getItem('currentUser')) || { name: 'User' };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      p: 2,
    }}>
      <Box sx={{ textAlign: 'center', mb: 3, mt: 2 }}>
        <Typography variant="h6" color="primary">Aarogya AI</Typography>
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3, 
        p: 2, 
        bgcolor: 'action.hover', 
        borderRadius: 1 
      }}>
        <Avatar sx={{ width: 48, height: 48, mr: 2 }}>
          <PersonIcon />
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography noWrap variant="subtitle1">{user.name || 'User'}</Typography>
          <Typography noWrap variant="body2" color="text.secondary">
            {user.email || 'user@example.com'}
          </Typography>
        </Box>
      </Box>
      
      <List sx={{ flexGrow: 1 }}>
        <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary={t('dashboard')} />
        </ListItem>
        <ListItem 
          button 
          sx={{ 
            borderRadius: 1, 
            mb: 0.5,
            '&:hover': {
              bgcolor: 'primary.light',
              '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                color: 'primary.dark'
              }
            }
          }}
          onClick={() => setOpenAIDoctor(true)}
        >
          <ListItemIcon><MedicalServicesIcon color="primary" /></ListItemIcon>
          <ListItemText 
            primary="AI Doctor" 
            primaryTypographyProps={{
              fontWeight: 'medium',
              color: 'primary.main'
            }}
          />
        </ListItem>
        <ListItem button sx={{ borderRadius: 1, mb: 0.5 }}>
          <ListItemIcon><HistoryIcon /></ListItemIcon>
          <ListItemText primary={t('medicalHistory')} />
        </ListItem>
        <ListItem 
          button 
          sx={{ borderRadius: 1, mb: 0.5 }}
          onClick={() => setOpenSettings(true)}
        >
          <ListItemIcon><SettingsIcon /></ListItemIcon>
          <ListItemText primary={t('settings')} />
        </ListItem>
      </List>
      
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ textTransform: 'none' }}
        >
          {t('logout')}
        </Button>
      </Box>
    </Box>
  );

  const AppointmentDialog = () => (
    <Dialog 
      open={openAppointment} 
      onClose={() => setOpenAppointment(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Book an Appointment</DialogTitle>
      <form onSubmit={handleSubmitAppointment}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={appointmentData.name}
                onChange={handleAppointmentChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                name="date"
                value={appointmentData.date}
                onChange={handleAppointmentChange}
                required
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Time"
                type="time"
                name="time"
                value={appointmentData.time}
                onChange={handleAppointmentChange}
                required
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Doctor</InputLabel>
                <Select
                  name="doctor"
                  value={appointmentData.doctor}
                  onChange={handleAppointmentChange}
                  required
                  label="Doctor"
                >
                  <MenuItem value="dr_smith">Dr. Smith (Cardiologist)</MenuItem>
                  <MenuItem value="dr_johnson">Dr. Johnson (Dermatologist)</MenuItem>
                  <MenuItem value="dr_williams">Dr. Williams (General Physician)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Visit"
                name="reason"
                value={appointmentData.reason}
                onChange={handleAppointmentChange}
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenAppointment(false)}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Book Appointment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );

  const SettingsDialog = () => (
    <Dialog 
      open={openSettings} 
      onClose={() => setOpenSettings(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Settings</DialogTitle>
      <form onSubmit={handleSubmitSettings}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Language</InputLabel>
                <Select
                  name="language"
                  value={settings.language}
                  onChange={handleSettingsChange}
                  label="Language"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications}
                    onChange={handleSettingsChange}
                    name="notifications"
                    color="primary"
                  />
                }
                label="Enable Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.darkMode}
                    onChange={handleSettingsChange}
                    name="darkMode"
                    color="primary"
                  />
                }
                label="Dark Mode"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={handleSettingsChange}
                    name="emailNotifications"
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="OpenAI API Key"
                name="openAIApiKey"
                type="password"
                value={settings.openAIApiKey || ''}
                onChange={handleSettingsChange}
                margin="normal"
                helperText="Required for AI Doctor functionality"
                placeholder="sk-..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenSettings(false)}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save Settings
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );

  const AIDoctorDialog = () => (
    <Dialog 
      open={openAIDoctor} 
      onClose={() => setOpenAIDoctor(false)}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          height: isMobile ? '100%' : '80vh',
          maxHeight: '800px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isMobile ? 0 : 2,
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ 
        bgcolor: 'primary.main',
        color: 'white',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Avatar sx={{ bgcolor: 'white', color: 'primary.main', mr: 2 }}>
          <MedicalServicesIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>AI Doctor</Typography>
          <Typography variant="caption" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center' }}>
            <Box component="span" sx={{ 
              width: 8, 
              height: 8, 
              bgcolor: '#4caf50', 
              borderRadius: '50%', 
              display: 'inline-block',
              mr: 1
            }} />
            Online
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton 
          color="inherit" 
          onClick={() => setOpenAIDoctor(false)}
          sx={{ color: 'white' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </IconButton>
      </Box>
      
      <Box 
        component="div" 
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
          bgcolor: '#e5ddd5',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29-22c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zM32 63c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-7.5c0 2.485-2.015 4.5-4.5 4.5S62 44.985 62 42.5s2.015-4.5 4.5-4.5 4.5 2.015 4.5 4.5z\' fill=\'%239C92AC\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '3px',
          },
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
              px: 1,
            }}
          >
            <Box
              sx={{
                maxWidth: '80%',
                p: 2,
                borderRadius: 2,
                bgcolor: message.sender === 'user' ? '#DCF8C6' : 'white',
                color: message.sender === 'user' ? 'black' : 'text.primary',
                boxShadow: '0 1px 0.5px rgba(0,0,0,0.1)',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  width: '12px',
                  height: '12px',
                  background: 'transparent',
                  [message.sender === 'user' ? 'right' : 'left']: '-8px',
                  borderBottomRightRadius: message.sender === 'user' ? '0' : '50%',
                  borderBottomLeftRadius: message.sender === 'user' ? '50%' : '0',
                  boxShadow: message.sender === 'user' 
                    ? '2px 2px 2px -2px rgba(0,0,0,0.1)' 
                    : '-2px 2px 2px -2px rgba(0,0,0,0.1)',
                  transform: 'translateY(-50%) rotate(45deg)',
                  backgroundColor: message.sender === 'user' ? '#DCF8C6' : 'white',
                },
              }}
            >
              {message.image && (
                <Box sx={{ 
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  mb: message.text ? 1 : 0
                }}>
                  <img 
                    src={message.image} 
                    alt="User upload" 
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }} 
                  />
                </Box>
              )}
              {message.text && (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {message.text}
                </Typography>
              )}
              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  textAlign: 'right',
                  mt: 0.5,
                  color: message.sender === 'user' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.4)',
                  fontSize: '0.7rem'
                }}
              >
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {message.sender === 'user' && (
                  <span style={{ marginLeft: 4 }}>
                    ✓✓
                  </span>
                )}
              </Typography>
            </Box>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', mb: 2, px: 1 }}>
            <Box
              sx={{
                maxWidth: '80%',
                p: 2,
                borderRadius: 2,
                bgcolor: 'white',
                boxShadow: '0 1px 0.5px rgba(0,0,0,0.1)',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '-8px',
                  width: '12px',
                  height: '12px',
                  background: 'transparent',
                  borderBottomRightRadius: '50%',
                  boxShadow: '-2px 2px 2px -2px rgba(0,0,0,0.1)',
                  transform: 'translateY(-50%) rotate(45deg)',
                  backgroundColor: 'white',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  bgcolor: 'rgba(0,0,0,0.3)', 
                  borderRadius: '50%',
                  margin: '0 2px',
                  animation: 'typing 1s infinite',
                  '&:nth-of-type(2)': {
                    animationDelay: '0.2s',
                  },
                  '&:nth-of-type(3)': {
                    animationDelay: '0.4s',
                  },
                  '@keyframes typing': {
                    '0%, 60%, 100%': { transform: 'translateY(0)' },
                    '30%': { transform: 'translateY(-5px)' },
                  },
                }} />
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  bgcolor: 'rgba(0,0,0,0.3)', 
                  borderRadius: '50%',
                  margin: '0 2px',
                  animation: 'typing 1s infinite 0.2s',
                }} />
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  bgcolor: 'rgba(0,0,0,0.3)', 
                  borderRadius: '50%',
                  margin: '0 2px',
                  animation: 'typing 1s infinite 0.4s',
                }} />
              </Box>
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      <Box 
        component="form" 
        onSubmit={handleAIDoctorSubmit}
        sx={{
          p: 2,
          bgcolor: '#f0f0f0',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <IconButton 
          sx={{ color: 'primary.main' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
        </IconButton>
        {imagePreview && (
          <Box sx={{ 
            position: 'relative',
            maxWidth: '100px',
            maxHeight: '100px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
            mr: 1
          }}>
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }} 
            />
            <IconButton 
              size="small"
              onClick={removeImage}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)',
                },
                padding: '4px',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </IconButton>
          </Box>
        )}
        <IconButton sx={{ color: 'primary.main' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        </IconButton>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message"
          value={aiDoctorInput}
          onChange={(e) => setAiDoctorInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAIDoctorSubmit(e);
            }
          }}
          multiline
          maxRows={4}
          size="small"
          sx={{
            bgcolor: 'white',
            borderRadius: '20px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              padding: '8px 16px',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'primary.light',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
        <IconButton 
          type="submit" 
          disabled={!aiDoctorInput.trim() || isLoading}
          sx={{ 
            color: 'primary.main',
            '&:disabled': {
              color: 'text.disabled'
            }
          }}
        >
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </IconButton>
      </Box>
    </Dialog>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            {t('dashboard')}
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={!isMobile || mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              borderRight: 'none',
              boxShadow: theme.shadows[3]
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          minHeight: 'calc(100vh - 64px)',
          p: { xs: 2, sm: 3, md: 4 },
          ml: { xs: 0, md: 0, lg: 0 },
          mt: { xs: '56px', sm: '64px' },
          mb: 0,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          '@media (min-width: 900px)': {
            padding: '32px',
            marginLeft: '0px'
          }
        }}
      >
        <Container maxWidth="sm" sx={{ mt: 6, mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontWeight: 600,
              mb: 4,
              fontSize: { xs: '1.75rem', sm: '2.125rem' },
              lineHeight: 1.2,
              color: 'text.primary'
            }}
          >
            {t('welcomeBack')}, {user.name || t('user')}!
          </Typography>
          
          <Box sx={{ 
            mt: 4,
            textAlign: 'center',
            color: 'text.secondary',
            maxWidth: '600px',
            mx: 'auto',
            px: 2
          }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Select an option from the menu to get started
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the AI Doctor for health inquiries or check your medical history
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Dialogs */}
      <AppointmentDialog />
      <SettingsDialog />
      <AIDoctorDialog />
    </Box>
  );
};

export default Home;
