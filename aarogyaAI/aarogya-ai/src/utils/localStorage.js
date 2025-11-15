const STORAGE_KEY = 'aarogya_ai_users';

// Initialize users in localStorage if not exists
const initUsers = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }
};

// Get all users
const getUsers = () => {
  initUsers();
  return JSON.parse(localStorage.getItem(STORAGE_KEY));
};

// Save users to localStorage
const saveUsers = (users) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

// Add a new user
const addUser = (userData) => {
  const users = getUsers();
  
  // Check if user already exists
  if (users.some(user => user.email === userData.email)) {
    return { success: false, message: 'User already exists' };
  }
  
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return { 
    success: true, 
    message: 'User registered successfully',
    user: newUser
  };
};

// Find user by email
const findUserByEmail = (email) => {
  const users = getUsers();
  return users.find(user => user.email === email);
};

// Update user password
const updatePassword = (email, newPassword) => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.email === email);
  
  if (userIndex === -1) {
    return { success: false, message: 'User not found' };
  }
  
  users[userIndex] = {
    ...users[userIndex],
    password: newPassword,
    updatedAt: new Date().toISOString()
  };
  
  saveUsers(users);
  return { 
    success: true, 
    message: 'Password updated successfully',
    user: users[userIndex]
  };
};

export { addUser, findUserByEmail, updatePassword };
