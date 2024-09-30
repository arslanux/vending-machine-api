import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Typography, Paper, Box } from '@mui/material';

const UserProfile = ({ username }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get(`/user/${username}`);
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchUserProfile();
  }, [username]);

  if (!user) {
    return <Typography>Loading user profile...</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" gutterBottom>User Profile</Typography>
      <Box>
        <Typography>Username: {user.username}</Typography>
        <Typography>Role: {user.role}</Typography>
        {user.role === 'buyer' && (
          <Typography>Current Deposit: ${user.deposit}</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default UserProfile;