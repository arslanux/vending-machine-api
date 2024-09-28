import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, ListItem, ListItemText, Button, TextField, Typography, Container, Paper, Grid } from '@mui/material';

const ProductList = ({ token, userRole }) => {
  const [products, setProducts] = useState([]);
  const [buyAmount, setBuyAmount] = useState({});
  const [depositAmount, setDepositAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/product', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setMessage('Failed to fetch products: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleBuy = async (productId) => {
    try {
      const response = await axios.post(`http://localhost:3000/product/buy/${productId}`, {
        amount: buyAmount[productId] || 1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(`Purchase successful. Total spent: ${response.data.totalSpent}, Change: ${response.data.change.join(', ')}`);
      fetchProducts(); // Refresh product list after purchase
    } catch (error) {
      setMessage('Purchase failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeposit = async () => {
    try {
      await axios.put('http://localhost:3000/user/deposit', 
        { amount: parseInt(depositAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Successfully deposited $${depositAmount}`);
      setDepositAmount('');
    } catch (error) {
      setMessage('Deposit failed: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom>Product List</Typography>
        
        {userRole === 'buyer' && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Deposit Amount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button onClick={handleDeposit} variant="contained" color="primary">
                Deposit
              </Button>
            </Grid>
          </Grid>
        )}

        <List>
          {products.map((product) => (
            <ListItem key={product.id} divider>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <ListItemText 
                    primary={product.productName} 
                    secondary={`Cost: $${product.cost}, Available: ${product.amountAvailable}`} 
                  />
                </Grid>
                {userRole === 'buyer' && (
                  <>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        type="number"
                        value={buyAmount[product.id] || ''}
                        onChange={(e) => setBuyAmount({ ...buyAmount, [product.id]: e.target.value })}
                        label="Amount"
                        variant="outlined"
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button 
                        onClick={() => handleBuy(product.id)}
                        variant="contained" 
                        color="primary"
                      >
                        Buy
                      </Button>
                    </Grid>
                  </>
                )}
              </Grid>
            </ListItem>
          ))}
        </List>
        
        {message && (
          <Typography color={message.includes('failed') ? 'error' : 'success'} sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ProductList;