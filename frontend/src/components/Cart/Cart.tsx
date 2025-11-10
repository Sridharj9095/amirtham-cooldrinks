import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem as CartItemType } from '../../types';
import { cartStorage, PendingOrder, pendingOrdersStorage, currentPendingOrderStorage } from '../../utils/localStorage';
import CartItem from './CartItem';
import MultiOrderManager from './MultiOrderManager';
import { Container, Box, Typography, Button, Paper, Divider, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Chip, Grid, Card, CardContent, CardActions, Snackbar, Alert, useTheme } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faTrash, faArrowRight, faClock, faCheckCircle, faSave, faEdit } from '@fortawesome/free-solid-svg-icons';

const Cart = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [clearCartDialogOpen, setClearCartDialogOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPendingOrder, setCurrentPendingOrder] = useState<PendingOrder | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccessSnackbar, setSaveSuccessSnackbar] = useState(false);
  const [reloadOrderDialogOpen, setReloadOrderDialogOpen] = useState(false);
  const [orderToReload, setOrderToReload] = useState<PendingOrder | null>(null);
  const [loadOrderDialogOpen, setLoadOrderDialogOpen] = useState(false);
  const [orderToLoad, setOrderToLoad] = useState<PendingOrder | null>(null);

  // Define functions before useEffect to avoid hoisting issues
  const loadPendingOrders = () => {
    try {
      const orders = pendingOrdersStorage.getOrders();
      setPendingOrders(orders || []);
    } catch (error) {
      setPendingOrders([]);
    }
  };

  const updateCart = () => {
    try {
      const items = cartStorage.getItems();
      setCartItems(items || []);
      const total = cartStorage.getTotalAmount() || 0;
      setTotalAmount(total);
    } catch (error) {
      setCartItems([]);
      setTotalAmount(0);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = () => {
      try {
        updateCart();
        loadPendingOrders();
        
        // Check if current cart is from a pending order
        const pendingOrderId = currentPendingOrderStorage.getCurrentPendingOrderId();
        if (pendingOrderId) {
          const order = pendingOrdersStorage.getOrder(pendingOrderId);
          setCurrentPendingOrder(order);
        } else {
          setCurrentPendingOrder(null);
        }
      } catch (error) {
        // Error loading cart data
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Listen for cart changes (when items are added from menu page)
  useEffect(() => {
    // Listen for storage changes (when cart is updated from other tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cart' || e.key === null) {
        updateCart();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll for changes (in case storage event doesn't fire for same-tab updates)
    // This detects when items are added from menu page while cart page is open
    const interval = setInterval(() => {
      const currentItems = cartStorage.getItems();
      const currentItemsStr = JSON.stringify(currentItems);
      const stateItemsStr = JSON.stringify(cartItems);
      
      // If cart items changed, update the state
      if (currentItemsStr !== stateItemsStr) {
        updateCart();
      }
    }, 500); // Check every 500ms

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [cartItems]);

  // Auto-save changes to pending order when cart items change
  useEffect(() => {
    const pendingOrderId = currentPendingOrderStorage.getCurrentPendingOrderId();
    if (pendingOrderId && cartItems.length >= 0) {
      // Check if cart has changed from the original pending order
      const originalOrder = pendingOrdersStorage.getOrder(pendingOrderId);
      if (originalOrder) {
        // Sort both arrays by item ID for consistent comparison
        const sortedCartItems = [...cartItems].sort((a, b) => a.id.localeCompare(b.id));
        const sortedOriginalItems = [...(originalOrder.items || [])].sort((a, b) => a.id.localeCompare(b.id));
        
        // Compare the sorted arrays
        const cartChanged = JSON.stringify(sortedCartItems) !== JSON.stringify(sortedOriginalItems);
        
        setHasUnsavedChanges(cartChanged);
        
        // Update currentPendingOrder if it's still valid
        if (originalOrder) {
          setCurrentPendingOrder(originalOrder);
        }
      } else {
        // Pending order not found, clear the tracking
        currentPendingOrderStorage.clearCurrentPendingOrderId();
        setCurrentPendingOrder(null);
        setHasUnsavedChanges(false);
      }
    } else {
      setHasUnsavedChanges(false);
      if (!pendingOrderId) {
        setCurrentPendingOrder(null);
      }
    }
  }, [cartItems]);

  const handleClearCartClick = () => {
    setClearCartDialogOpen(true);
  };

  const handleClearCartConfirm = () => {
    cartStorage.clearCart();
    // Also clear the pending order ID when cart is manually cleared
    currentPendingOrderStorage.clearCurrentPendingOrderId();
    setCurrentPendingOrder(null);
    setHasUnsavedChanges(false);
    updateCart();
    setClearCartDialogOpen(false);
  };

  const handleClearCartCancel = () => {
    setClearCartDialogOpen(false);
  };

  const handleProceedToBilling = () => {
    if (cartItems.length > 0) {
      // When proceeding to billing, the current cart is isolated
      // Other pending orders remain untouched and won't interfere
      navigate('/billing');
    }
  };

  const handleSelectOrder = (order: PendingOrder) => {
    // Check if this is the same order that's already loaded
    const currentPendingOrderId = currentPendingOrderStorage.getCurrentPendingOrderId();
    if (currentPendingOrderId === order.id) {
      // Same order is already loaded, ask for confirmation
      setOrderToReload(order);
      setReloadOrderDialogOpen(true);
      return;
    }

    // Check if cart has items before loading a different order
    if (cartItems.length > 0) {
      // Show confirmation dialog for loading different order
      setOrderToLoad(order);
      setLoadOrderDialogOpen(true);
      return;
    }

    // Cart is empty, proceed with loading
    loadOrderIntoCart(order);
  };

  const handleLoadOrderConfirm = () => {
    if (orderToLoad) {
      loadOrderIntoCart(orderToLoad);
      setLoadOrderDialogOpen(false);
      setOrderToLoad(null);
    }
  };

  const handleLoadOrderCancel = () => {
    setLoadOrderDialogOpen(false);
    setOrderToLoad(null);
  };

  const loadOrderIntoCart = (order: PendingOrder) => {
    // Clear current cart first, then load the selected order
    // This operation is isolated - it only affects the current cart
    // Other pending orders remain untouched in localStorage
    cartStorage.clearCart();
    cartStorage.saveItems(order.items);
    // Track which pending order is now in the cart
    currentPendingOrderStorage.setCurrentPendingOrderId(order.id);
    setCurrentPendingOrder(order);
    setHasUnsavedChanges(false);
    updateCart();
    loadPendingOrders(); // Refresh pending orders list
  };

  const handleReloadOrderConfirm = () => {
    if (orderToReload) {
      // Reload the same order (this will reset any unsaved changes)
      loadOrderIntoCart(orderToReload);
      setReloadOrderDialogOpen(false);
      setOrderToReload(null);
    }
  };

  const handleReloadOrderCancel = () => {
    setReloadOrderDialogOpen(false);
    setOrderToReload(null);
  };

  const handleSaveChanges = () => {
    const pendingOrderId = currentPendingOrderStorage.getCurrentPendingOrderId();
    if (pendingOrderId && cartItems.length > 0) {
      // Update the pending order with current cart items
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      pendingOrdersStorage.updateOrder(pendingOrderId, {
        items: cartItems,
        totalAmount,
      });
      
      // Update local state
      const updatedOrder = pendingOrdersStorage.getOrder(pendingOrderId);
      setCurrentPendingOrder(updatedOrder);
      setHasUnsavedChanges(false);
      loadPendingOrders(); // Refresh pending orders list
      
      // Show success message
      setSaveSuccessSnackbar(true);
    }
  };

  if (isLoading) {
    return (
      <Container 
        maxWidth="md" 
        sx={{
          py: { xs: 4, sm: 8 },
          px: { xs: 2, sm: 3 },
          textAlign: 'center',
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Loading cart...
        </Typography>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="md" 
      sx={{
        py: { xs: 4, sm: 8 },
        px: { xs: 2, sm: 3 },
        minHeight: '400px',
        backgroundColor: 'background.paper',
      }}
    >
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 4, sm: 6 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Typography 
          variant="h4" 
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          Shopping Cart
        </Typography>
        <MultiOrderManager
          currentCartItems={cartItems}
          onSelectOrder={handleSelectOrder}
          onCartCleared={() => {
            updateCart();
            loadPendingOrders();
          }}
          onOrdersUpdated={loadPendingOrders}
        />
      </Box>

      {/* Show empty cart message only if cart is empty AND there are no pending orders */}
      {cartItems.length === 0 && pendingOrders.length === 0 ? (
        <Paper 
          sx={{ 
            mb: 4, 
            p: 6,
            textAlign: 'center',
          }}
        >
          <FontAwesomeIcon 
            icon={faShoppingCart} 
            style={{ 
              fontSize: '64px', 
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9ca3af', 
              marginBottom: '16px' 
            }} 
          />
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Add some delicious items from the menu!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            size="large"
          >
            Browse Menu
          </Button>
        </Paper>
      ) : null}

      {/* Pending Orders Section */}
      {pendingOrders.length > 0 && (
        <Paper 
          sx={{ 
            mb: 4, 
            p: 3,
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid',
            borderColor: 'rgba(239, 68, 68, 0.2)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FontAwesomeIcon icon={faClock} style={{ color: '#ef4444' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Pending Orders ({pendingOrders.length})
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {pendingOrders.map((order) => {
              const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
              return (
                <Grid item xs={12} sm={6} md={4} key={order.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                    onClick={() => {
                      handleSelectOrder(order);
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                          {order.name}
                        </Typography>
                        <Chip
                          label={`${totalItems} items`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.75rem' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.1rem' }}>
                        ₹{order.totalAmount.toFixed(2)}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ pt: 0, pb: 1, px: 1.5 }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectOrder(order);
                        }}
                      >
                        Load Order
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {/* Current Cart Items */}
      {cartItems.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#16a34a' }} />
              Current Cart Items
            </Typography>
            {currentPendingOrder && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 1,
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: { xs: '100%', sm: 'auto' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                }}
              >
                <Chip
                  label={`Editing: ${currentPendingOrder.name}`}
                  size="small"
                  color="info"
                  icon={<FontAwesomeIcon icon={faEdit} style={{ fontSize: '12px' }} />}
                  sx={{ 
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  }}
                />
                {hasUnsavedChanges && (
                  <Chip
                    label="Unsaved Changes"
                    size="small"
                    color="warning"
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    }}
                  />
                )}
              </Box>
            )}
          </Box>
          {cartItems.map(item => (
            <CartItem key={item.id} item={item} onUpdate={updateCart} />
          ))}
        </Box>
      )}

      {/* Empty Cart Message (only if no pending orders) */}
      {cartItems.length === 0 && pendingOrders.length > 0 && (
        <Paper 
          sx={{ 
            mb: 4, 
            p: 4,
            textAlign: 'center',
            backgroundColor: 'rgba(239, 68, 68, 0.02)',
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <FontAwesomeIcon 
            icon={faShoppingCart} 
            style={{ 
              fontSize: '48px', 
              color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9ca3af', 
              marginBottom: '16px' 
            }} 
          />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Current Cart is Empty
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Load a pending order above or add new items from the menu
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            startIcon={<FontAwesomeIcon icon={faShoppingCart} />}
          >
            Browse Menu
          </Button>
        </Paper>
      )}

      {/* Total and Action Buttons - Only show if cart has items */}
      {cartItems.length > 0 && (
      <Paper 
        sx={{
          p: { xs: 3, sm: 4 },
          position: 'sticky',
          bottom: 16,
          zIndex: 10,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography 
            variant="h6"
            sx={{
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Total Amount:
          </Typography>
          <Typography 
            variant="h5" 
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            ₹{totalAmount}
          </Typography>
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        {/* Save Changes Button (only shown when editing a pending order) */}
        {currentPendingOrder && hasUnsavedChanges && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              color="success"
              startIcon={<FontAwesomeIcon icon={faSave} />}
              onClick={handleSaveChanges}
              fullWidth
              sx={{
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              Save Changes to "{currentPendingOrder.name}"
            </Button>
          </Box>
        )}
        
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            color="error"
            startIcon={<FontAwesomeIcon icon={faTrash} />}
            onClick={handleClearCartClick}
            fullWidth
            sx={{
              flex: { xs: 'none', sm: 1 },
            }}
          >
            Clear Cart
          </Button>
          <Button
            variant="contained"
            color="primary"
            endIcon={<FontAwesomeIcon icon={faArrowRight} />}
            onClick={handleProceedToBilling}
            fullWidth
            sx={{
              flex: { xs: 'none', sm: 1 },
            }}
          >
            Proceed to Billing
          </Button>
        </Box>
      </Paper>
      )}

      {/* Clear Cart Confirmation Dialog */}
      <Dialog
        open={clearCartDialogOpen}
        onClose={handleClearCartCancel}
        aria-labelledby="clear-cart-dialog-title"
        aria-describedby="clear-cart-dialog-description"
      >
        <DialogTitle id="clear-cart-dialog-title">
          Clear Shopping Cart?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-cart-dialog-description">
            {(() => {
              const pendingOrderId = currentPendingOrderStorage.getCurrentPendingOrderId();
              const isSaved = !!pendingOrderId;
              
              if (!isSaved && cartItems.length > 0) {
                return `Make sure you have saved all cart items before clearing. Are you sure you want to remove all ${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} from your cart? This action cannot be undone.`;
              }
              
              return 'Are you sure you want to remove all items from your cart? This action cannot be undone.';
            })()}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClearCartCancel} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleClearCartConfirm} 
            color="error" 
            variant="contained"
            startIcon={<FontAwesomeIcon icon={faTrash} />}
          >
            Clear Cart
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Order Confirmation Dialog (when cart has items) */}
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
                Current cart has {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}. Loading "{orderToLoad.name}" will replace current cart. Continue?
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

      {/* Reload Same Order Confirmation Dialog */}
      <Dialog
        open={reloadOrderDialogOpen}
        onClose={handleReloadOrderCancel}
        aria-labelledby="reload-order-dialog-title"
        aria-describedby="reload-order-dialog-description"
      >
        <DialogTitle id="reload-order-dialog-title">
          Reload Same Order?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="reload-order-dialog-description">
            The order "{orderToReload?.name}" is already loaded in your cart.
            {hasUnsavedChanges && (
              <>
                <br /><br />
                <strong>Warning:</strong> You have unsaved changes. Reloading will discard all your current modifications and restore the original order items.
              </>
            )}
            <br /><br />
            Do you want to reload this order? This will replace your current cart items with the original order items.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReloadOrderCancel} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleReloadOrderConfirm} 
            color="primary" 
            variant="contained"
            startIcon={<FontAwesomeIcon icon={faShoppingCart} />}
          >
            Reload Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Save Success Snackbar */}
      <Snackbar
        open={saveSuccessSnackbar}
        autoHideDuration={3000}
        onClose={() => setSaveSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSaveSuccessSnackbar(false)}
          severity="success"
          sx={{ width: '100%' }}
          icon={<FontAwesomeIcon icon={faSave} />}
        >
          Changes saved to "{currentPendingOrder?.name}" successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Cart;

