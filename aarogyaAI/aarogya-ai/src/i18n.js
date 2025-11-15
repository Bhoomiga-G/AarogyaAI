import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Common
      login: 'Login',
      register: 'Register',
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      submit: 'Submit',
      selectLanguage: 'Select Language',
      welcome: 'Welcome to Aarogya AI',
      forgotPassword: 'Forgot Password?',
      createAccount: 'Create Account',
      alreadyHaveAccount: 'Already have an account?',
      backToLogin: 'Back to Login',
      back: 'Back',
      continue: 'Continue',
      resetPassword: 'Reset Password',
      
      // Form Fields
      fullName: 'Full Name',
      emailAddress: 'Email Address',
      phoneNumber: 'Phone Number',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      
      // Validation Messages
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email',
      phoneRequired: 'Phone number is required',
      phoneInvalid: 'Please enter a valid 10-digit phone number',
      passwordRequired: 'Password is required',
      passwordLength: 'Password must be at least 6 characters',
      passwordsDontMatch: 'Passwords do not match',
      
      // Status Messages
      registrationSuccess: 'Registration successful! Redirecting to login...',
      registrationFailed: 'Registration failed. Please try again.',
      passwordResetSuccess: 'Password reset successful! Redirecting to login...',
      passwordResetFailed: 'Failed to reset password. Please try again.',
      emailNotFound: 'No account found with this email address',
      
      // Instructions
      enterEmailForReset: 'Enter your email address and we\'ll send you a link to reset your password.',
      enterNewPassword: 'Please enter your new password',
      
      // Errors
      loginError: 'Invalid username or password',
      
      // Home/Dashboard
      dashboard: 'Dashboard',
      appointments: 'Appointments',
      medicalHistory: 'Medical History',
      settings: 'Settings',
      logout: 'Logout',
      welcomeBack: 'Welcome back',
      user: 'User',
      quickActions: 'Quick Actions',
      bookAppointment: 'Book Appointment',
      viewReports: 'View Reports',
      findDoctor: 'Find a Doctor',
      recentActivity: 'Recent Activity',
      appointmentBooked: 'Appointment booked with Dr. Smith',
      today: 'Today',
      yourHealth: 'Your Health at a Glance',
      upcomingAppointments: 'Upcoming',
      prescriptions: 'Prescriptions',
      reports: 'Reports',
      alerts: 'Alerts',
    },
  },
  ta: {
    translation: {
      // Common
      login: 'உள்நுழைய',
      register: 'பதிவு செய்க',
      username: 'பயனர்பெயர்',
      password: 'கடவுச்சொல்',
      confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
      submit: 'சமர்ப்பிக்கவும்',
      selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
      welcome: 'ஆரோக்கிய AI க்கு வரவேற்கிறோம்',
      forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
      createAccount: 'கணக்கை உருவாக்கு',
      alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
      backToLogin: 'உள்நுழைவுக்கு திரும்பு',
      back: 'பின்செல்',
      continue: 'தொடரவும்',
      resetPassword: 'கடவுச்சொல்லை மீட்டமைக்கவும்',
      
      // Form Fields
      fullName: 'முழு பெயர்',
      emailAddress: 'மின்னஞ்சல் முகவரி',
      phoneNumber: 'தொலைபேசி எண்',
      newPassword: 'புதிய கடவுச்சொல்',
      confirmNewPassword: 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்',
      
      // Validation Messages
      nameRequired: 'பெயர் தேவை',
      emailRequired: 'மின்னஞ்சல் தேவை',
      emailInvalid: 'சரியான மின்னஞ்சலை உள்ளிடவும்',
      phoneRequired: 'தொலைபேசி எண் தேவை',
      phoneInvalid: 'சரியான 10 இலக்க தொலைபேசி எண்ணை உள்ளிடவும்',
      passwordRequired: 'கடவுச்சொல் தேவை',
      passwordLength: 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்',
      passwordsDontMatch: 'கடவுச்சொற்கள் பொருந்தவில்லை',
      
      // Status Messages
      registrationSuccess: 'பதிவு வெற்றிகரமாக முடிந்தது! உள்நுழைவு பக்கத்திற்கு திருப்பி விடப்படுகிறது...',
      registrationFailed: 'பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
      passwordResetSuccess: 'கடவுச்சொல் மீட்டமைப்பு வெற்றிகரமாக முடிந்தது! உள்நுழைவு பக்கத்திற்கு திருப்பி விடப்படுகிறது...',
      passwordResetFailed: 'கடவுச்சொல்லை மீட்டமைக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
      emailNotFound: 'இந்த மின்னஞ்சல் முகவரியுடன் கணக்கு எதுவும் கிடைக்கவில்லை',
      
      // Instructions
      enterEmailForReset: 'உங்கள் மின்னஞ்சல் முகவரியை உள்ளிட்டால், உங்கள் கடவுச்சொல்லை மீட்டமைக்க ஒரு இணைப்பை அனுப்புவோம்.',
      enterNewPassword: 'உங்கள் புதிய கடவுச்சொல்லை உள்ளிடவும்',
      
      // Errors
      loginError: 'தவறான பயனர்பெயர் அல்லது கடவுச்சொல்',
      
      // Home/Dashboard
      dashboard: 'டாஷ்போர்டு',
      appointments: 'நியமனங்கள்',
      medicalHistory: 'மருத்துவ வரலாறு',
      settings: 'அமைப்புகள்',
      logout: 'வெளியேறு',
      welcomeBack: 'மீண்டும் வருக',
      user: 'பயனர்',
      quickActions: 'விரைவு செயல்கள்',
      bookAppointment: 'நியமனம் செய்க',
      viewReports: 'அறிக்கைகளைப் பார்க்கவும்',
      findDoctor: 'மருத்துவரைத் தேடுங்கள்',
      recentActivity: 'சமீபத்திய செயல்பாடு',
      appointmentBooked: 'டாக்டர் ஸ்மித் அவர்களுடனான நியமனம்',
      today: 'இன்று',
      yourHealth: 'உங்கள் ஆரோக்கியம்',
      upcomingAppointments: 'வரவிருக்கும் நியமனங்கள்',
      prescriptions: 'மருந்துப்பிரிதாள்கள்',
      reports: 'அறிக்கைகள்',
      alerts: 'எச்சரிக்கைகள்',
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
