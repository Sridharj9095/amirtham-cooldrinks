import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, useTheme, Paper, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { Order } from '../../types';

interface QRPaymentProps {
  open: boolean;
  onClose: () => void;
  order: Order;
  onPaymentComplete: () => void;
}

const QRPayment = ({ open, onClose, order, onPaymentComplete }: QRPaymentProps) => {
  const theme = useTheme();
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [loadingUpiId, setLoadingUpiId] = useState(true);

  useEffect(() => {
    // Load UPI ID from API when dialog opens
    const fetchUpiId = async () => {
      if (open) {
        setLoadingUpiId(true);
        try {
          const apiUrl = import.meta.env.PROD ? '/api/settings' : 'http://localhost:5001/api/settings';
          const response = await axios.get(apiUrl);
          setUpiId(response.data.upiId || '');
        } catch (error) {
          console.error('Error fetching UPI ID:', error);
          // Fallback to localStorage if API fails
          const storedUpiId = localStorage.getItem('amirtham_upi_id') || '';
          setUpiId(storedUpiId);
        } finally {
          setLoadingUpiId(false);
        }
      }
    };

    fetchUpiId();
  }, [open]);

  // Generate UPI payment string
  const generateUpiString = () => {
    if (!upiId) return '';
    // UPI payment format: upi://pay?pa=<UPI_ID>&am=<AMOUNT>&cu=INR&tn=<TRANSACTION_NOTE>
    const amount = order.totalAmount.toFixed(2);
    const transactionNote = `Payment for Order ${order.orderNumber}`;
    return `upi://pay?pa=${encodeURIComponent(upiId)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  };

  const upiPaymentString = generateUpiString();

  const handleConfirmPayment = () => {
    setPaymentConfirmed(true);
    setTimeout(() => {
      onPaymentComplete();
      setPaymentConfirmed(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Payment via UPI QR Code</DialogTitle>
      <DialogContent>
        {paymentConfirmed ? (
          <Box className="text-center py-8">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-6xl text-green-500 mb-4"
            />
            <Typography variant="h6" className="mb-2">
              Payment Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your order has been confirmed.
            </Typography>
          </Box>
        ) : (
          <Box className="text-center">
            <Box className="mb-4">
              {loadingUpiId ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary">
                    Loading payment settings...
                  </Typography>
                </Box>
              ) : upiId && upiPaymentString ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      backgroundColor: 'white',
                      display: 'inline-block',
                    }}
                  >
                    <QRCodeSVG
                      value={upiPaymentString}
                      size={250}
                      level="H"
                      includeMargin={true}
                    />
                  </Paper>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Scan this QR code with your UPI app to pay ₹{order.totalAmount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    UPI ID: {upiId}
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 4,
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.02)',
                    borderRadius: 2,
                    border: `2px dashed ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    UPI ID not configured
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please add your UPI ID in Settings to generate payment QR code.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      onClose();
                      window.location.href = '/settings';
                    }}
                  >
                    Go to Settings
                  </Button>
                </Box>
              )}
            </Box>
            <Paper 
              elevation={0}
              sx={{ 
                mt: 4, 
                p: 4, 
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.02)',
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Order Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Order Number: {order.orderNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Amount: ₹{order.totalAmount}
              </Typography>
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!paymentConfirmed && (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmPayment}
            >
              Confirm Payment
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QRPayment;

