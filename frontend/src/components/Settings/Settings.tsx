import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCog, 
  faSun, 
  faMoon, 
  faTrash, 
  faDatabase, 
  faDownload, 
  faBell, 
  faVolumeUp,
  faInfoCircle,
  faExclamationTriangle,
  faQrcode,
  faEdit,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { cartStorage, pendingOrdersStorage, menuStorage, categoryStorage } from '../../utils/localStorage';
import axios from 'axios';

interface SettingsProps {
  darkMode: boolean;
  onDarkModeChange: (darkMode: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ darkMode, onDarkModeChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State for dialogs and notifications
  const [clearCartDialogOpen, setClearCartDialogOpen] = useState(false);
  const [clearPendingOrdersDialogOpen, setClearPendingOrdersDialogOpen] = useState(false);
  const [clearAllDataDialogOpen, setClearAllDataDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Settings preferences (stored in MongoDB)
  const [soundNotifications, setSoundNotifications] = useState(true);
  const [autoSaveOrders, setAutoSaveOrders] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [upiIdEditMode, setUpiIdEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch settings from API on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiUrl = import.meta.env.PROD ? '/api/settings' : 'http://localhost:5001/api/settings';
        const response = await axios.get(apiUrl);
        setUpiId(response.data.upiId || '');
        setSoundNotifications(response.data.soundNotifications ?? true);
        setAutoSaveOrders(response.data.autoSaveOrders ?? false);
        // Also sync to localStorage for backward compatibility with other features
        if (response.data.soundNotifications !== undefined) {
          localStorage.setItem('amirtham_sound_notifications', response.data.soundNotifications.toString());
        }
        if (response.data.autoSaveOrders !== undefined) {
          localStorage.setItem('amirtham_auto_save_orders', response.data.autoSaveOrders.toString());
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // Fallback to localStorage if API fails
        const storedUpiId = localStorage.getItem('amirtham_upi_id') || '';
        const storedSound = localStorage.getItem('amirtham_sound_notifications');
        const storedAutoSave = localStorage.getItem('amirtham_auto_save_orders');
        setUpiId(storedUpiId);
        setSoundNotifications(storedSound ? storedSound === 'true' : true);
        setAutoSaveOrders(storedAutoSave ? storedAutoSave === 'true' : false);
        setSnackbar({ open: true, message: 'Failed to load settings from server', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleThemeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDarkModeChange(event.target.checked);
  };

  const handleSoundNotificationsToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setSoundNotifications(value);
    
    try {
      const apiUrl = import.meta.env.PROD ? '/api/settings' : 'http://localhost:5001/api/settings';
      await axios.put(apiUrl, {
        soundNotifications: value,
        autoSaveOrders,
        upiId,
      });
      // Also update localStorage for backward compatibility
      localStorage.setItem('amirtham_sound_notifications', value.toString());
      setSnackbar({ open: true, message: `Sound notifications ${value ? 'enabled' : 'disabled'}`, severity: 'success' });
    } catch (error) {
      console.error('Error updating sound notifications:', error);
      // Fallback to localStorage
      localStorage.setItem('amirtham_sound_notifications', value.toString());
      setSnackbar({ open: true, message: 'Failed to save to server, saved locally', severity: 'info' });
    }
  };

  const handleAutoSaveToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setAutoSaveOrders(value);
    
    try {
      const apiUrl = import.meta.env.PROD ? '/api/settings' : 'http://localhost:5001/api/settings';
      await axios.put(apiUrl, {
        soundNotifications,
        autoSaveOrders: value,
        upiId,
      });
      // Also update localStorage for backward compatibility
      localStorage.setItem('amirtham_auto_save_orders', value.toString());
      setSnackbar({ open: true, message: `Auto-save orders ${value ? 'enabled' : 'disabled'}`, severity: 'success' });
    } catch (error) {
      console.error('Error updating auto-save orders:', error);
      // Fallback to localStorage
      localStorage.setItem('amirtham_auto_save_orders', value.toString());
      setSnackbar({ open: true, message: 'Failed to save to server, saved locally', severity: 'info' });
    }
  };

  const handleClearCart = () => {
    cartStorage.clearCart();
    setClearCartDialogOpen(false);
    setSnackbar({ open: true, message: 'Cart data cleared successfully', severity: 'success' });
  };

  const handleClearPendingOrders = () => {
    pendingOrdersStorage.saveOrders([]);
    setClearPendingOrdersDialogOpen(false);
    setSnackbar({ open: true, message: 'All pending orders cleared successfully', severity: 'success' });
  };

  const handleClearAllData = () => {
    // Clear all local storage data
    cartStorage.clearCart();
    pendingOrdersStorage.saveOrders([]);
    menuStorage.saveItems([]);
    categoryStorage.saveCategories([]);
    setClearAllDataDialogOpen(false);
    setSnackbar({ open: true, message: 'All local data cleared successfully', severity: 'success' });
  };

  const handleExportData = () => {
    try {
      const data = {
        cart: cartStorage.getItems(),
        pendingOrders: pendingOrdersStorage.getOrders(),
        menuItems: menuStorage.getItems(),
        categories: categoryStorage.getCategories(),
        exportDate: new Date().toISOString(),
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `amirtham-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: 'Data exported successfully', severity: 'success' });
    } catch (error) {
      console.error('Error exporting data:', error);
      setSnackbar({ open: true, message: 'Failed to export data', severity: 'error' });
    }
  };

  const getDataStats = () => {
    const cartItems = cartStorage.getItems();
    const pendingOrders = pendingOrdersStorage.getOrders();
    const menuItems = menuStorage.getItems();
    const categories = categoryStorage.getCategories();
    
    return {
      cartItems: cartItems.length,
      pendingOrders: pendingOrders.length,
      menuItems: menuItems.length,
      categories: categories.length,
    };
  };

  const stats = getDataStats();

  const handleUpiIdSave = async () => {
    if (!upiId.trim()) {
      setSnackbar({ open: true, message: 'Please enter a valid UPI ID', severity: 'error' });
      return;
    }

    try {
      const apiUrl = import.meta.env.PROD ? '/api/settings/upi-id' : 'http://localhost:5001/api/settings/upi-id';
      const response = await axios.put(apiUrl, {
        upiId: upiId.trim(),
      });
      setUpiId(response.data.upiId);
      setUpiIdEditMode(false);
      setSnackbar({ open: true, message: 'UPI ID saved successfully to database', severity: 'success' });
    } catch (error: any) {
      console.error('Error saving UPI ID:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save UPI ID';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleUpiIdCancel = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/settings');
      setUpiId(response.data.upiId || '');
    } catch (error) {
      console.error('Error fetching UPI ID:', error);
      // Fallback to localStorage if API fails
      const storedUpiId = localStorage.getItem('amirtham_upi_id') || '';
      setUpiId(storedUpiId);
    }
    setUpiIdEditMode(false);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Loading settings...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <FontAwesomeIcon
            icon={faCog}
            style={{
              fontSize: isMobile ? '24px' : '28px',
              color: theme.palette.primary.main,
            }}
          />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Settings
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Appearance
          </Typography>
          
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              backgroundColor: darkMode 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 2,
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 2 },
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1.5, sm: 2 }, 
                width: '100%',
                flex: 1,
              }}>
                <Box
                  sx={{
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: darkMode
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    flexShrink: 0,
                  }}
                >
                  <FontAwesomeIcon
                    icon={darkMode ? faMoon : faSun}
                    style={{
                      fontSize: isMobile ? '20px' : '24px',
                      color: darkMode ? '#fff' : '#ef4444',
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1.2 }}>
                    {darkMode ? 'Dark Mode' : 'Light Mode'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, lineHeight: 1.4 }}>
                    {darkMode
                      ? 'Switch to light mode for a brighter interface'
                      : 'Switch to dark mode for a comfortable viewing experience'}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                width: { xs: '100%', sm: 'auto' },
                pl: { xs: '56px', sm: 0 }, // Align with icon on mobile
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={handleThemeToggle}
                      size={isMobile ? 'medium' : 'medium'}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#ef4444',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#ef4444',
                        },
                      }}
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
              </Box>
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Payment Settings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Payment Settings
          </Typography>
          
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              backgroundColor: darkMode 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 2,
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              gap: { xs: 1.5, sm: 2 }, 
              mb: 2,
              flexDirection: { xs: 'column', sm: 'row' },
            }}>
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: darkMode
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  flexShrink: 0,
                }}
              >
                <FontAwesomeIcon
                  icon={faQrcode}
                  style={{
                    fontSize: isMobile ? '20px' : '24px',
                    color: darkMode ? '#fff' : '#ef4444',
                  }}
                />
              </Box>
              <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1.2 }}>
                  UPI ID
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, lineHeight: 1.4 }}>
                  Enter your UPI ID to generate payment QR codes (e.g., yourname@paytm, yourname@ybl)
                </Typography>
              </Box>
            </Box>

            {!upiIdEditMode ? (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                mt: 2,
                flexDirection: { xs: 'column', sm: 'row' },
              }}>
                <TextField
                  fullWidth
                  label="UPI ID"
                  value={upiId || 'Not set'}
                  disabled
                  variant="outlined"
                  size="small"
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faQrcode} style={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<FontAwesomeIcon icon={faEdit} />}
                  onClick={() => setUpiIdEditMode(true)}
                  sx={{ 
                    minWidth: { xs: '100%', sm: '120px' },
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  {upiId ? 'Edit' : 'Add'}
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  fullWidth
                  label="UPI ID"
                  placeholder="e.g., yourname@paytm, yourname@ybl, yourname@phonepe"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  variant="outlined"
                  size="small"
                  helperText="Enter your UPI ID to generate payment QR codes"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FontAwesomeIcon icon={faQrcode} style={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  justifyContent: { xs: 'stretch', sm: 'flex-end' },
                  flexDirection: { xs: 'column', sm: 'row' },
                }}>
                  <Button
                    variant="outlined"
                    onClick={handleUpiIdCancel}
                    fullWidth={isMobile}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FontAwesomeIcon icon={faSave} />}
                    onClick={handleUpiIdSave}
                    fullWidth={isMobile}
                  >
                    Save
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Notifications Settings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Notifications
          </Typography>
          
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              backgroundColor: darkMode 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 2,
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 2 },
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1.5, sm: 2 }, 
                width: '100%',
                flex: 1,
              }}>
                <Box
                  sx={{
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: darkMode
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    flexShrink: 0,
                  }}
                >
                  <FontAwesomeIcon
                    icon={faVolumeUp}
                    style={{
                      fontSize: isMobile ? '20px' : '24px',
                      color: darkMode ? '#fff' : '#ef4444',
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1.2 }}>
                    Sound Notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, lineHeight: 1.4 }}>
                    Play sound alerts for order completions and important actions
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                width: { xs: '100%', sm: 'auto' },
                pl: { xs: '56px', sm: 0 }, // Align with icon on mobile
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={soundNotifications}
                      onChange={handleSoundNotificationsToggle}
                      size={isMobile ? 'medium' : 'medium'}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#ef4444',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#ef4444',
                        },
                      }}
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
              </Box>
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Order Preferences */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Order Preferences
          </Typography>
          
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              backgroundColor: darkMode 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 2,
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 2 },
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1.5, sm: 2 }, 
                width: '100%',
                flex: 1,
              }}>
                <Box
                  sx={{
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: darkMode
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(239, 68, 68, 0.1)',
                    flexShrink: 0,
                  }}
                >
                  <FontAwesomeIcon
                    icon={faBell}
                    style={{
                      fontSize: isMobile ? '20px' : '24px',
                      color: darkMode ? '#fff' : '#ef4444',
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.95rem', sm: '1rem' }, lineHeight: 1.2 }}>
                    Auto-Save Orders
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, lineHeight: 1.4 }}>
                    Automatically save cart items as pending orders when adding items
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                width: { xs: '100%', sm: 'auto' },
                pl: { xs: '56px', sm: 0 }, // Align with icon on mobile
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoSaveOrders}
                      onChange={handleAutoSaveToggle}
                      size={isMobile ? 'medium' : 'medium'}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#ef4444',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#ef4444',
                        },
                      }}
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
              </Box>
            </Box>
          </Paper>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Data Management */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Data Management
          </Typography>
          
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              backgroundColor: darkMode 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 2,
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            {/* Data Statistics */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Current Data Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 1.5 } }}>
                <Chip 
                  label={`Cart: ${stats.cartItems} items`} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
                <Chip 
                  label={`Pending Orders: ${stats.pendingOrders}`} 
                  size="small" 
                  color="info" 
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
                <Chip 
                  label={`Menu Items: ${stats.menuItems}`} 
                  size="small" 
                  color="success" 
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
                <Chip 
                  label={`Categories: ${stats.categories}`} 
                  size="small" 
                  color="warning" 
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Action Buttons */}
            <List sx={{ p: 0 }}>
              <ListItem
                sx={{
                  px: 0,
                  py: 1.5,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                }}
              >
                <ListItemText
                  primary="Export Data"
                  secondary="Download all your data as JSON file"
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                />
                <ListItemSecondaryAction
                  sx={{
                    position: { xs: 'relative', sm: 'absolute' },
                    right: { xs: 'auto', sm: 0 },
                    top: { xs: 'auto', sm: '50%' },
                    transform: { xs: 'none', sm: 'translateY(-50%)' },
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FontAwesomeIcon icon={faDownload} />}
                    onClick={handleExportData}
                    fullWidth={isMobile}
                  >
                    Export
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem
                sx={{
                  px: 0,
                  py: 1.5,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                }}
              >
                <ListItemText
                  primary="Clear Cart Data"
                  secondary="Remove all items from shopping cart"
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                />
                <ListItemSecondaryAction
                  sx={{
                    position: { xs: 'relative', sm: 'absolute' },
                    right: { xs: 'auto', sm: 0 },
                    top: { xs: 'auto', sm: '50%' },
                    transform: { xs: 'none', sm: 'translateY(-50%)' },
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => setClearCartDialogOpen(true)}
                    disabled={stats.cartItems === 0}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem
                sx={{
                  px: 0,
                  py: 1.5,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                }}
              >
                <ListItemText
                  primary="Clear Pending Orders"
                  secondary="Remove all saved pending orders"
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                />
                <ListItemSecondaryAction
                  sx={{
                    position: { xs: 'relative', sm: 'absolute' },
                    right: { xs: 'auto', sm: 0 },
                    top: { xs: 'auto', sm: '50%' },
                    transform: { xs: 'none', sm: 'translateY(-50%)' },
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => setClearPendingOrdersDialogOpen(true)}
                    disabled={stats.pendingOrders === 0}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>

              <ListItem
                sx={{
                  px: 0,
                  py: 1.5,
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                }}
              >
                <ListItemText
                  primary="Clear All Local Data"
                  secondary="Remove all cart, orders, and menu data from browser"
                  primaryTypographyProps={{
                    sx: { color: 'error.main', fontWeight: 600 },
                  }}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                />
                <ListItemSecondaryAction
                  sx={{
                    position: { xs: 'relative', sm: 'absolute' },
                    right: { xs: 'auto', sm: 0 },
                    top: { xs: 'auto', sm: '50%' },
                    transform: { xs: 'none', sm: 'translateY(-50%)' },
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => setClearAllDataDialogOpen(true)}
                  >
                    <FontAwesomeIcon icon={faDatabase} />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* About Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            About
          </Typography>
          
          <Paper
            elevation={0}
            sx={{
              p: 3,
              backgroundColor: darkMode 
                ? 'rgba(255, 255, 255, 0.05)' 
                : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 2,
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FontAwesomeIcon
                icon={faInfoCircle}
                style={{
                  fontSize: '24px',
                  color: theme.palette.primary.main,
                }}
              />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  Amirtham Cooldrinks
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Restaurant Ordering System
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Version 1.0.0
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your menu, process orders, and track sales efficiently.
            </Typography>
          </Paper>
        </Box>

        {/* Clear Cart Dialog */}
        <Dialog
          open={clearCartDialogOpen}
          onClose={() => setClearCartDialogOpen(false)}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ef4444' }} />
              Clear Cart Data?
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to clear all items from your shopping cart? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearCartDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleClearCart} color="error" variant="contained" startIcon={<FontAwesomeIcon icon={faTrash} />}>
              Clear Cart
            </Button>
          </DialogActions>
        </Dialog>

        {/* Clear Pending Orders Dialog */}
        <Dialog
          open={clearPendingOrdersDialogOpen}
          onClose={() => setClearPendingOrdersDialogOpen(false)}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ef4444' }} />
              Clear All Pending Orders?
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete all {stats.pendingOrders} pending orders? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearPendingOrdersDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleClearPendingOrders} color="error" variant="contained" startIcon={<FontAwesomeIcon icon={faTrash} />}>
              Clear All Orders
            </Button>
          </DialogActions>
        </Dialog>

        {/* Clear All Data Dialog */}
        <Dialog
          open={clearAllDataDialogOpen}
          onClose={() => setClearAllDataDialogOpen(false)}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ color: '#ef4444' }} />
              Clear All Local Data?
            </Box>
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              <strong>Warning:</strong> This will permanently delete all local data including:
              <ul style={{ marginTop: '8px', marginBottom: '8px' }}>
                <li>All cart items</li>
                <li>All pending orders</li>
                <li>All menu items (local storage)</li>
                <li>All categories</li>
              </ul>
              This action cannot be undone. Make sure you have exported your data if needed.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClearAllDataDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleClearAllData} color="error" variant="contained" startIcon={<FontAwesomeIcon icon={faDatabase} />}>
              Clear All Data
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity} 
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default Settings;

