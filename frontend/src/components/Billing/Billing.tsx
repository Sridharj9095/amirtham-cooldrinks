import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartStorage, pendingOrdersStorage, currentPendingOrderStorage } from '../../utils/localStorage';
import { Order } from '../../types';
import QRPayment from './QRPayment';
import axios from 'axios';
import { Container, Paper, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Dialog, DialogContent, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faCreditCard, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getApiBaseUrl } from '../../utils/api';

const Billing = () => {
  const navigate = useNavigate();
  const [cartItems] = useState(cartStorage.getItems());
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate] = useState(new Date());
  const [qrPaymentOpen, setQrPaymentOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    setTotalAmount(cartStorage.getTotalAmount());
    setOrderNumber(`ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    
    // Ensure billing page is isolated - lock the current cart items
    // Other pending orders remain untouched in localStorage
  }, []);

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Calculate item total for verification
    const itemTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create receipt HTML
    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${orderNumber}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              padding: 20px 15px;
              width: 80mm;
              max-width: 80mm;
            }
            .receipt-header {
              text-align: center;
              margin-bottom: 15px;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
            }
            .receipt-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .receipt-subtitle {
              font-size: 11px;
              color: #666;
              margin-bottom: 3px;
            }
            .receipt-info {
              margin: 10px 0;
              font-size: 11px;
            }
            .receipt-info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .receipt-divider {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .receipt-items {
              margin: 10px 0;
            }
            .receipt-item {
              margin-bottom: 8px;
            }
            .receipt-item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
            }
            .item-name {
              flex: 1;
              font-weight: bold;
            }
            .item-quantity {
              margin: 0 10px;
              font-weight: bold;
            }
            .item-price {
              text-align: right;
              min-width: 60px;
            }
            .item-total {
              text-align: right;
              font-weight: bold;
              margin-top: 2px;
            }
            .receipt-total {
              margin-top: 15px;
              border-top: 2px dashed #000;
              padding-top: 10px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .grand-total {
              font-size: 16px;
              border-top: 2px solid #000;
              padding-top: 5px;
              margin-top: 5px;
            }
            .receipt-footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px dashed #000;
              font-size: 10px;
            }
            .thank-you {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 5px;
              text-transform: uppercase;
            }
            @media print {
              body {
                padding: 15px 10px;
              }
              @page {
                size: 80mm auto;
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt-header">
            <div class="receipt-title">Amirtham Cooldrinks</div>
            <div class="receipt-subtitle">Fresh Juices & Milkshakes</div>
            <div class="receipt-subtitle">Thank You for Your Visit!</div>
          </div>

          <div class="receipt-info">
            <div class="receipt-info-row">
              <span>Order No:</span>
              <span><strong>${orderNumber}</strong></span>
            </div>
            <div class="receipt-info-row">
              <span>Date:</span>
              <span>${orderDate.toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}</span>
            </div>
            <div class="receipt-info-row">
              <span>Time:</span>
              <span>${orderDate.toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
          </div>

          <div class="receipt-divider"></div>

          <div class="receipt-items">
            <div class="receipt-item-row" style="font-weight: bold; margin-bottom: 5px; border-bottom: 1px solid #000; padding-bottom: 3px;">
              <span>Item</span>
              <span style="margin: 0 10px;">Qty</span>
              <span style="text-align: right; min-width: 60px;">Amount</span>
            </div>
            ${cartItems.map(item => `
              <div class="receipt-item">
                <div class="receipt-item-row">
                  <span class="item-name">${item.name}</span>
                  <span class="item-quantity">${item.quantity}</span>
                  <span class="item-price">₹${item.price}</span>
                </div>
                <div class="item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>

          <div class="receipt-total">
            <div class="receipt-divider"></div>
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${itemTotal.toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <span>GRAND TOTAL:</span>
              <span>₹${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div class="receipt-footer">
            <div class="thank-you">Thank You!</div>
            <div>Please Visit Again</div>
            <div style="margin-top: 10px; font-size: 9px;">This is a computer generated receipt</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Close the window after printing (optional)
      // printWindow.close();
    }, 250);
  };

  const handlePayNow = () => {
    setQrPaymentOpen(true);
  };

  const handlePaymentComplete = async () => {
    try {
      const orderData = {
        orderNumber,
        items: cartItems,
        totalAmount,
        date: orderDate,
        status: 'completed' as const,
      };

      console.log('Saving order:', orderData);
      
      const apiUrl = `${getApiBaseUrl()}/orders`;
      const response = await axios.post(apiUrl, orderData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });
      
      console.log('Order saved successfully:', response.data);
      
      const savedOrder: Order = {
        orderNumber: response.data.orderNumber,
        items: response.data.items,
        totalAmount: response.data.totalAmount,
        date: new Date(response.data.date),
        status: response.data.status,
        _id: response.data._id,
      };
      setOrder(savedOrder);
      
      // IMPORTANT: Get pending order ID BEFORE clearing cart
      // because clearCart() also clears the pending order ID
      const pendingOrderId = currentPendingOrderStorage.getCurrentPendingOrderId();
      console.log('Payment completed. Checking for pending order ID:', pendingOrderId);
      
      // If this order came from a pending order, remove it from pending orders
      if (pendingOrderId) {
        console.log('Removing completed pending order:', pendingOrderId);
        pendingOrdersStorage.removeOrder(pendingOrderId);
        currentPendingOrderStorage.clearCurrentPendingOrderId();
        console.log('Pending order removed after successful payment');
      } else {
        console.log('No pending order ID found - order was not from a pending order');
      }
      
      // Clear cart after successful payment
      // This only clears the current cart being billed
      // Note: clearCart() will also clear the pending order ID, but we already handled it above
      cartStorage.clearCart();
      
      // Close QR payment dialog and show redirection message
      setQrPaymentOpen(false);
      setRedirecting(true);
      
      // Navigate back to menu after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      console.error('Error saving order:', error);
      
      let errorMessage = 'Error saving order. Please try again.';
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please make sure the backend server is running on port 5000.';
      } else if (error.response) {
        // Server responded with error status
        errorMessage = `Error: ${error.response.data?.error || error.response.statusText || 'Server error'}`;
        console.error('Response error:', error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check if the backend is running.';
      }
      
      alert(errorMessage);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <Container maxWidth="md" className="py-8">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Button
          startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
          onClick={() => navigate('/cart')}
        >
          Back to Cart
        </Button>
        <Box sx={{ 
          px: 2, 
          py: 1, 
          backgroundColor: 'info.light', 
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'info.main',
        }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.dark' }}>
            🔒 Billing in Progress - Order #{orderNumber}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Other pending orders are safely stored and won't be affected
          </Typography>
        </Box>
      </Box>

      <Paper id="bill-content" className="p-6 print:shadow-none">
        <Box className="text-center mb-6 no-print">
          <Typography variant="h4" className="font-bold mb-2">
            Amirtham Cooldrinks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fresh Juices & Milkshakes
          </Typography>
        </Box>

        <Box className="mb-4">
          <Typography variant="h6" className="mb-2">
            Order Number: {orderNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Date: {orderDate.toLocaleString()}
          </Typography>
        </Box>

        <Divider className="my-4" />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.quantity}</TableCell>
                  <TableCell align="right">₹{item.price}</TableCell>
                  <TableCell align="right">₹{item.price * item.quantity}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="font-bold">
                  Grand Total
                </TableCell>
                <TableCell align="right" className="font-bold text-primary-600">
                  ₹{totalAmount}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box 
          className="mt-6 no-print"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faPrint} />}
            onClick={handlePrint}
            fullWidth
            sx={{
              flex: { xs: 'none', sm: 1 },
            }}
          >
            Print Bill
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeIcon icon={faCreditCard} />}
            onClick={handlePayNow}
            fullWidth
            sx={{
              flex: { xs: 'none', sm: 1 },
            }}
          >
            Pay Now
          </Button>
        </Box>
      </Paper>

      <QRPayment
        open={qrPaymentOpen}
        onClose={() => setQrPaymentOpen(false)}
        order={order || {
          orderNumber,
          items: cartItems,
          totalAmount,
          date: orderDate,
          status: 'pending',
        }}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Redirection Loading Dialog */}
      <Dialog
        open={redirecting}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 4,
            minWidth: { xs: '280px', sm: '400px' },
          },
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              mb: 3,
              color: 'primary.main',
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              mb: 2,
              color: 'success.main',
            }}
          >
            Payment Successful!
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Order #{orderNumber} has been completed.
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mt: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <CircularProgress size={16} sx={{ color: 'text.secondary' }} />
            Redirecting to home page...
          </Typography>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Billing;

