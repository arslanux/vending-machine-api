import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';

const theme = createTheme();

function App() {
  const [apiStatus, setApiStatus] = useState({});

  useEffect(() => {
    const checkEndpoint = async (endpoint) => {
      try {
        await axios.get(`http://localhost:3000${endpoint}`);
        return true;
      } catch (error) {
        return false;
      }
    };

    const checkApiStatus = async () => {
      const endpoints = ['/user', '/product', '/auth/status'];
      const status = {};

      for (const endpoint of endpoints) {
        status[endpoint] = await checkEndpoint(endpoint);
      }

      setApiStatus(status);
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            API Status
          </Typography>
          <List>
            {Object.entries(apiStatus).map(([endpoint, status]) => (
              <ListItem key={endpoint}>
                <ListItemIcon>
                  {status ? <CheckCircle color="primary" /> : <Error color="error" />}
                </ListItemIcon>
                <ListItemText primary={endpoint} secondary={status ? 'Online' : 'Offline'} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;