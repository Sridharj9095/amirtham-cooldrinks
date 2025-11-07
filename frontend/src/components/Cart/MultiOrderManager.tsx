import { useState, useEffect } from 'react';
import { CartItem } from '../../types';
import { pendingOrdersStorage, PendingOrder, cartStorage } from '../../utils/localStorage';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Chip,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrash, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

interface MultiOrderManagerProps {
  currentCartItems: CartItem[];
  onSelectOrder: (order: PendingOrder) => void;
  onCartCleared: () => void;
  onOrdersUpdated?: () => void;
}

const MultiOrderManager = ({ currentCartItems, onSelectOrder, onCartCleared, onOrdersUpdated }: MultiOrderManagerProps) => {
  const [open, setOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [savedOrderName, setSavedOrderName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<PendingOrder | null>(null);
  const [loadOrderDialogOpen, setLoadOrderDialogOpen] = useState(false);
  const [orderToLoad, setOrderToLoad] = useState<PendingOrder | null>(null);

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = () => {
    setPendingOrders(pendingOrdersStorage.getOrders());
  };

  const handleSaveCurrentOrder = () => {
    if (currentCartItems.length === 0) {
      alert('Cart is empty. Add items before saving.');
      return;
    }
    setSaveDialogOpen(true);
  };

  const handleSaveConfirm = () => {
    if (!orderName.trim()) {
      alert('Please enter an order name (e.g., Table 1, Customer 2)');
      return;
    }
    
    // Save current cart as pending order
    const savedName = orderName.trim();
    pendingOrdersStorage.addOrder(savedName, currentCartItems);
    loadPendingOrders();
    
    // Clear the current cart so user can start a fresh order
    // The saved order remains in Manage Orders for future use
    cartStorage.clearCart();
    onCartCleared();
    
    // Notify parent component to refresh pending orders list
    if (onOrdersUpdated) {
      onOrdersUpdated();
    }
    
    setSavedOrderName(savedName);
    setOrderName('');
    setSaveDialogOpen(false);
    setSuccessSnackbarOpen(true);
    
    // If there was a selected order to load, load it now
    if (selectedOrderId) {
      const orderToLoad = pendingOrdersStorage.getOrder(selectedOrderId);
      if (orderToLoad) {
        onSelectOrder(orderToLoad);
        setSelectedOrderId(null);
        setOpen(false);
      } else {
        setOpen(true);
      }
    } else {
      setOpen(true);
    }
  };

  const handleLoadOrder = (order: PendingOrder) => {
    if (currentCartItems.length > 0) {
      // Show confirmation dialog
      setOrderToLoad(order);
      setLoadOrderDialogOpen(true);
      return;
    }
    // Load order directly if cart is empty
    onSelectOrder(order);
    setOpen(false);
  };

  const handleLoadOrderConfirm = () => {
    if (orderToLoad) {
      // Load order directly (replaces current cart)
      onSelectOrder(orderToLoad);
      setLoadOrderDialogOpen(false);
      setOrderToLoad(null);
      setOpen(false);
    }
  };

  const handleLoadOrderCancel = () => {
    setLoadOrderDialogOpen(false);
    setOrderToLoad(null);
  };

  const handleDeleteOrder = (order: PendingOrder, e: React.MouseEvent) => {
    e.stopPropagation();
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (orderToDelete) {
      pendingOrdersStorage.removeOrder(orderToDelete.id);
      loadPendingOrders();
      // Notify parent component to refresh pending orders list
      if (onOrdersUpdated) {
        onOrdersUpdated();
      }
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  const getTotalItems = (order: PendingOrder): number => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FontAwesomeIcon icon={faShoppingCart} />}
        onClick={() => setOpen(true)}
        sx={{
          minWidth: { xs: 'auto', sm: '180px' },
        }}
      >
        Manage Orders ({pendingOrders.length})
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Typography 
              variant="h6"
              sx={{
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                textAlign: { xs: 'center', sm: 'left' },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              Manage Pending Orders
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<FontAwesomeIcon icon={faSave} />}
              onClick={handleSaveCurrentOrder}
              disabled={currentCartItems.length === 0}
              sx={{
                width: { xs: '100%', sm: 'auto' },
                minWidth: { xs: '100%', sm: 'auto' },
              }}
            >
              Save Current Cart
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {pendingOrders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No pending orders. Save your current cart to create one.
              </Typography>
            </Box>
          ) : (
            <List>
              {pendingOrders.map((order) => (
                <Paper
                  key={order.id}
                  sx={{
                    mb: 2,
                    cursor: 'pointer',
                    border: selectedOrderId === order.id ? '2px solid' : '1px solid',
                    borderColor: selectedOrderId === order.id ? 'primary.main' : 'divider',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                  onClick={() => {
                    // Load order - this will replace current cart
                    // Other pending orders remain safe and untouched
                    handleLoadOrder(order);
                  }}
                >
                  <ListItem
                    sx={{
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      pr: { xs: 2, sm: 7 },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            gap: 1, 
                            mb: 1,
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            width: '100%',
                          }}
                        >
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: { xs: '1rem', sm: '1.25rem' },
                            }}
                          >
                            {order.name}
                          </Typography>
                          <Chip
                            label={`${getTotalItems(order)} items`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 0.5, sm: 2 },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mb: { xs: 0.5, sm: 0 },
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            }}
                          >
                            Created: {new Date(order.createdAt).toLocaleString()}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600, 
                              color: 'primary.main',
                              fontSize: { xs: '0.9rem', sm: '0.875rem' },
                            }}
                          >
                            Total: ₹{order.totalAmount.toFixed(2)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction
                      sx={{
                        position: { xs: 'relative', sm: 'absolute' },
                        right: { xs: 'auto', sm: 0 },
                        top: { xs: 'auto', sm: '50%' },
                        transform: { xs: 'none', sm: 'translateY(-50%)' },
                        mt: { xs: 1, sm: 0 },
                        alignSelf: { xs: 'flex-end', sm: 'auto' },
                      }}
                    >
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={(e) => {
                          // Delete only this specific order
                          // Other orders remain untouched
                          handleDeleteOrder(order, e);
                        }}
                        sx={{ 
                          mr: { xs: 0, sm: 1 },
                          size: { xs: 'small', sm: 'medium' },
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Save Order Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>
          {selectedOrderId ? 'Save Current Cart Before Loading Another Order' : 'Save Current Cart as Pending Order'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Order Name"
            placeholder="e.g., Table 1, Customer 2, Order A"
            fullWidth
            variant="outlined"
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
            sx={{ mt: 2 }}
            helperText={selectedOrderId 
              ? "Save current cart with a name, then the selected order will be loaded"
              : "Cart will be cleared after saving. Order will be available in Manage Orders for future use."
            }
          />
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Items: {currentCartItems.length} | Total: ₹{currentCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSaveDialogOpen(false);
            setOrderName('');
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveConfirm}
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeIcon icon={faSave} />}
            disabled={!orderName.trim()}
          >
            Save Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
          icon={<FontAwesomeIcon icon={faSave} />}
        >
          Order "{savedOrderName}" saved successfully! Cart cleared. You can now start a new order.
        </Alert>
      </Snackbar>

      {/* Delete Order Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-order-dialog-title"
        aria-describedby="delete-order-dialog-description"
      >
        <DialogTitle id="delete-order-dialog-title">
          Delete Pending Order?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-order-dialog-description">
            {orderToDelete && (
              <>
                Are you sure you want to delete <strong>"{orderToDelete.name}"</strong>?
                <Box sx={{ mt: 2, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Order Details:</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Items: {orderToDelete.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total: ₹{orderToDelete.totalAmount.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(orderToDelete.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>
                <Typography variant="body2" color="error" sx={{ mt: 2, fontWeight: 600 }}>
                  This action cannot be undone.
                </Typography>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={<FontAwesomeIcon icon={faTrash} />}
          >
            Delete Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Order Confirmation Dialog */}
      <Dialog
        open={loadOrderDialogOpen}
        onClose={handleLoadOrderCancel}
        aria-labelledby="load-order-dialog-title"
        aria-describedby="load-order-dialog-description"
      >
        <DialogTitle id="load-order-dialog-title">
          Load Order?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="load-order-dialog-description">
            {orderToLoad && (
              <>
                Current cart has {currentCartItems.length} {currentCartItems.length === 1 ? 'item' : 'items'}. Loading "{orderToLoad.name}" will replace current cart. Continue?
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoadOrderCancel} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleLoadOrderConfirm}
            color="primary"
            variant="contained"
            startIcon={<FontAwesomeIcon icon={faShoppingCart} />}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MultiOrderManager;

