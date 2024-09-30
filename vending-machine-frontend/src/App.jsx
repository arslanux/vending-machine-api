import React, { useState } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import Register from './components/Register';
import Login from './components/Login';
import ProductList from './components/ProductList';
import SellerDashboard from './components/SellerDashboard';
import UserProfile from './components/UserProfile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentView, setCurrentView] = useState('login');

  const handleLogin = (newToken, newUsername, role) => {
    setToken(newToken);
    setUsername(newUsername);
    setUserRole(role);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/auth/logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToken(null);
      setUsername(null);
      setUserRole(null);
      setCurrentView('login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await axios.post('http://localhost:3000/auth/logout-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setToken(null);
      setUsername(null);
      setUserRole(null);
      setCurrentView('login');
    } catch (error) {
      console.error('Logout all failed:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Vending Machine
          </Typography>
          {!token && (
            <Box sx={{ mb: 2 }}>
              <Button onClick={() => setCurrentView('login')} sx={{ mr: 1 }}>Login</Button>
              <Button onClick={() => setCurrentView('register')}>Register</Button>
            </Box>
          )}
          {token && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">Logged in as: {username} ({userRole})</Typography>
              <Button onClick={handleLogout} sx={{ mr: 1 }}>Logout</Button>
              <Button onClick={handleLogoutAll}>Logout All Sessions</Button>
            </Box>
          )}
          {currentView === 'login' && <Login onLogin={handleLogin} />}
          {currentView === 'register' && <Register />}
          {currentView === 'dashboard' && (
            <>
              <UserProfile username={username} />
              {userRole === 'buyer' && <ProductList userRole={userRole} />}
              {userRole === 'seller' && <SellerDashboard />}
            </>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;