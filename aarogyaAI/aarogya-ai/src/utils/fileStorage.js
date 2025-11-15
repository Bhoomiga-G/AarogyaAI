import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
const ensureDataDirectory = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
};

// Read users from file
const readUsers = () => {
  ensureDataDirectory();
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

// Save users to file
const saveUsers = (users) => {
  ensureDataDirectory();
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving users file:', error);
    return false;
  }
};

// Add a new user
const addUser = (userData) => {
  const users = readUsers();
  // Check if user already exists
  if (users.some(user => user.email === userData.email)) {
    return { success: false, message: 'User already exists' };
  }
  
  users.push({
    id: Date.now().toString(),
    ...userData,
    createdAt: new Date().toISOString()
  });
  
  return saveUsers(users) 
    ? { success: true, message: 'User registered successfully' }
    : { success: false, message: 'Failed to save user' };
};

// Find user by email
const findUserByEmail = (email) => {
  const users = readUsers();
  return users.find(user => user.email === email);
};

// Update user password
const updatePassword = (email, newPassword) => {
  const users = readUsers();
  const userIndex = users.findIndex(user => user.email === email);
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  users[userIndex] = {
    ...users[userIndex],
    password: newPassword,
    updatedAt: new Date().toISOString()
  };
  
  return saveUsers(users)
    ? { success: true, message: 'Password updated successfully' }
    : { success: false, message: 'Failed to update password' };
};

export { addUser, findUserByEmail, updatePassword };
