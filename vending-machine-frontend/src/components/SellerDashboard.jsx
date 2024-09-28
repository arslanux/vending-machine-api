import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { List, ListItem, ListItemText, Button, TextField, Typography, Container, Paper, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const SellerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({ productName: '', cost: '', amountAvailable: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/product');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setMessage('Failed to fetch products: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/product', currentProduct);
      setMessage('Product created successfully');
      setOpenDialog(false);
      fetchProducts();
    } catch (error) {
      setMessage('Failed to create product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/product/${currentProduct.id}`, currentProduct);
      setMessage('Product updated successfully');
      setOpenDialog(false);
      fetchProducts();
    } catch (error) {
      setMessage('Failed to update product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/product/${id}`);
      setMessage('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      setMessage('Failed to delete product: ' + (error.response?.data?.message || error.message));
    }
  };

  const openCreateDialog = () => {
    setCurrentProduct({ productName: '', cost: '', amountAvailable: '' });
    setOpenDialog(true);
  };

  const openUpdateDialog = (product) => {
    setCurrentProduct(product);
    setOpenDialog(true);
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h4" gutterBottom>Seller Dashboard</Typography>
        <Button onClick={openCreateDialog} variant="contained" color="primary" sx={{ mb: 2 }}>
          Create New Product
        </Button>
        <List>
          {products.map((product) => (
            <ListItem key={product.id} divider>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <ListItemText 
                    primary={product.productName} 
                    secondary={`Cost: $${product.cost}, Available: ${product.amountAvailable}`} 
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button onClick={() => openUpdateDialog(product)} variant="outlined">
                    Update
                  </Button>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button onClick={() => handleDelete(product.id)} variant="outlined" color="error">
                    Delete
                  </Button>
                </Grid>
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{currentProduct.id ? 'Update Product' : 'Create Product'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Product Name"
            type="text"
            fullWidth
            value={currentProduct.productName}
            onChange={(e) => setCurrentProduct({...currentProduct, productName: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Cost"
            type="number"
            fullWidth
            value={currentProduct.cost}
            onChange={(e) => setCurrentProduct({...currentProduct, cost: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Amount Available"
            type="number"
            fullWidth
            value={currentProduct.amountAvailable}
            onChange={(e) => setCurrentProduct({...currentProduct, amountAvailable: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={currentProduct.id ? handleUpdate : handleCreate}>
            {currentProduct.id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SellerDashboard;