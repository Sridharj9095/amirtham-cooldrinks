import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../../utils/api';
import {
  Container,
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  useTheme,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faTrash, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const SalesReport = () => {
  const theme = useTheme();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [salesData, setSalesData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'dailySummary' | 'transactions'>('chart');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [transactionsToShow, setTransactionsToShow] = useState(5);
  const observerTarget = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef(5);
  const [newlyLoadedIndices, setNewlyLoadedIndices] = useState<Set<number>>(new Set());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  
  // Delete transactions state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteRangeType, setDeleteRangeType] = useState<'month' | 'date'>('month');
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1);
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  
  // Swipe detection for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  // Minimum swipe distance (in pixels)
  const minSwipeDistance = 50;

  // Sort transactions by date (defined early so it can be used in useEffect hooks)
  const sortedOrders = useMemo(() => {
    if (!salesData?.orders || !Array.isArray(salesData.orders)) {
      return [];
    }
    
    const orders = [...salesData.orders];
    
    if (sortOrder === null) {
      // Default: newest first (descending)
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    
    if (sortOrder === 'asc') {
      return orders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  }, [salesData?.orders, sortOrder]);

  useEffect(() => {
    fetchSalesData();
    // Reset transactions to show when month/year changes
    setTransactionsToShow(5);
    previousCountRef.current = 5;
    setNewlyLoadedIndices(new Set());
  }, [year, month]);

  // Reset transactions when switching to transactions view
  useEffect(() => {
    if (viewMode === 'transactions' && salesData?.orders) {
      // Always reset to 5 when switching to transactions view
      setTransactionsToShow(5);
      previousCountRef.current = 5;
      setNewlyLoadedIndices(new Set());
    }
  }, [viewMode]);

  // Ensure transactionsToShow never exceeds available orders
  useEffect(() => {
    if (sortedOrders && Array.isArray(sortedOrders)) {
      if (transactionsToShow > sortedOrders.length) {
        setTransactionsToShow(sortedOrders.length);
      }
    }
  }, [sortedOrders, transactionsToShow]);

  // Infinite scroll observer - optimized for faster loading
  useEffect(() => {
    // Only set up observer when in transactions view mode
    if (viewMode !== 'transactions') {
      return;
    }

    // Don't set up observer if no data or all transactions are already shown
    if (!sortedOrders || 
        !Array.isArray(sortedOrders) || 
        sortedOrders.length === 0 ||
        transactionsToShow >= sortedOrders.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Double-check conditions before loading more
        if (entries[0].isIntersecting && 
            sortedOrders && 
            Array.isArray(sortedOrders) &&
            transactionsToShow < sortedOrders.length) {
          // Load more transactions immediately when the observer target is visible
          setTransactionsToShow((prev) => {
            // Final check to prevent loading beyond available transactions
            if (!sortedOrders || 
                !Array.isArray(sortedOrders) ||
                prev >= sortedOrders.length) {
              return prev;
            }
            
            const next = prev + 5;
            const newValue = Math.min(next, sortedOrders.length);
            
            // Track newly loaded indices for animation
            const newIndices = new Set<number>();
            for (let i = prev; i < newValue; i++) {
              newIndices.add(i);
            }
            setNewlyLoadedIndices(newIndices);
            
            // Update previous count for animation tracking
            previousCountRef.current = prev;
            
            // Clear animation indices after animation completes
            setTimeout(() => {
              setNewlyLoadedIndices(new Set());
            }, 800);
            
            return newValue;
          });
        }
      },
      { 
        threshold: 0.1, // Trigger when 10% of the target is visible
        rootMargin: '50px' // Start loading 50px before reaching the target (reduced to prevent auto-loading)
      }
    );

    // Use a small delay to ensure DOM is ready, especially after navigation
    const timeoutId = setTimeout(() => {
      const currentTarget = observerTarget.current;
      if (currentTarget && 
          viewMode === 'transactions' &&
          transactionsToShow < sortedOrders.length) {
        try {
          observer.observe(currentTarget);
        } catch (error) {
          // Error observing target
        }
      }
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      if (observerTarget.current) {
        try {
          observer.unobserve(observerTarget.current);
        } catch (error) {
          // Element might already be removed
        }
      }
      observer.disconnect();
    };
  }, [sortedOrders, transactionsToShow, viewMode]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const apiUrl = `${getApiBaseUrl()}/sales/monthly`;
      const response = await axios.get(apiUrl, {
        params: { year, month },
      });
      setSalesData(response.data);
      // Reset to show only 5 transactions initially when new data is fetched
      setTransactionsToShow(5);
      previousCountRef.current = 5;
      setNewlyLoadedIndices(new Set());
      // Reset sort order when fetching new data
      setSortOrder(null);
    } catch (error) {
      // Error fetching sales data
    } finally {
      setLoading(false);
    }
  };

  const handleSortToggle = () => {
    if (sortOrder === null || sortOrder === 'desc') {
      setSortOrder('asc'); // Oldest first
    } else {
      setSortOrder('desc'); // Newest first
    }
    // Reset to show first 5 when sorting changes
    setTransactionsToShow(5);
    previousCountRef.current = 5;
    setNewlyLoadedIndices(new Set());
  };

  const chartData = salesData
    ? {
        labels: salesData.dailyTransactions.map((d: any) => {
          const date = new Date(d.date);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }),
        datasets: [
          {
            label: 'Daily Sales (₹)',
            data: salesData.dailyTransactions.map((d: any) => d.totalAmount),
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 2,
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Monthly Sales Report - ${month}/${year}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return '₹' + value;
          },
        },
      },
    },
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left - go to next tab
      if (viewMode === 'chart') {
        setViewMode('table');
      } else if (viewMode === 'table') {
        setViewMode('dailySummary');
      } else if (viewMode === 'dailySummary') {
        setViewMode('transactions');
      }
    }

    if (isRightSwipe) {
      // Swipe right - go to previous tab
      if (viewMode === 'transactions') {
        setViewMode('dailySummary');
      } else if (viewMode === 'dailySummary') {
        setViewMode('table');
      } else if (viewMode === 'table') {
        setViewMode('chart');
      }
    }
  };

  const handleDeleteTransactions = async () => {
    setDeleteLoading(true);
    try {
      let start: Date;
      let end: Date;

      if (deleteRangeType === 'month') {
        // Calculate start and end dates for month range
        start = new Date(startYear, startMonth - 1, 1);
        end = new Date(endYear, endMonth, 0, 23, 59, 59, 999); // Last day of end month
      } else {
        // Use date range
        start = new Date(startDate);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
      }

      const apiUrl = `${getApiBaseUrl()}/orders/range/by-date`;
      const response = await axios.delete(apiUrl, {
        data: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      });

      setDeleteConfirmOpen(false);
      setDeleteDialogOpen(false);
      setSnackbar({
        open: true,
        message: `Successfully deleted ${response.data.deletedCount} transaction(s)`,
        severity: 'success',
      });

      // Refresh the sales data
      await fetchSalesData();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Failed to delete transactions',
        severity: 'error',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadPDF = (_type: 'monthly' | 'daily' | 'all') => {
    if (!salesData) return;

    const doc = new jsPDF();
    const monthName = months.find(m => m.value === month)?.label || `Month ${month}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Amirtham Cooldrinks', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Sales Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    doc.setFontSize(12);
    doc.text(`${monthName} ${year}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Summary', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Sales: Rs. ${salesData.totalSales.toFixed(2)}`, margin, yPos);
    yPos += 7;
    doc.text(`Total Orders: ${salesData.orderCount}`, margin, yPos);
    yPos += 7;
    const avgOrderValue = salesData.orderCount > 0 ? (salesData.totalSales / salesData.orderCount) : 0;
    doc.text(`Average Order Value: Rs. ${avgOrderValue.toFixed(2)}`, margin, yPos);
    yPos += 15;

    // Daily Transactions Table (always included)
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Daily Transactions', margin, yPos);
    yPos += 10;

    // Table Header
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Date', margin, yPos);
    doc.text('Day', margin + 50, yPos);
    doc.text('Orders', margin + 80, yPos);
    doc.text('Total Sales', margin + 120, yPos);
    yPos += 7;

    // Draw line under header
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;

    // Table Rows
    doc.setFont('helvetica', 'normal');
    salesData.dailyTransactions.forEach((day: any) => {
      checkPageBreak(10);
      const date = new Date(day.date);
      const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });

      doc.text(dateStr, margin, yPos);
      doc.text(dayName, margin + 50, yPos);
      doc.text(day.orderCount.toString(), margin + 80, yPos);
      doc.text(`Rs. ${day.totalAmount.toFixed(2)}`, margin + 120, yPos);
      yPos += 7;
    });

    // Total Row
    yPos += 3;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', margin, yPos);
    doc.text(salesData.orderCount.toString(), margin + 80, yPos);
    doc.text(`Rs. ${salesData.totalSales.toFixed(2)}`, margin + 120, yPos);
    yPos += 15;

    // All Transactions Section (always included for monthly report)
    if (salesData.orders && salesData.orders.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('All Transactions', margin, yPos);
      yPos += 10;

      salesData.orders.forEach((order: any, index: number) => {
        checkPageBreak(25);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Order #${index + 1}: ${order.orderNumber}`, margin, yPos);
        yPos += 6;

        doc.setFont('helvetica', 'normal');
        const orderDate = new Date(order.date);
        doc.text(`Date: ${orderDate.toLocaleString('en-IN')}`, margin, yPos);
        yPos += 6;

        doc.text('Items:', margin, yPos);
        yPos += 5;
        order.items.forEach((item: any) => {
          doc.text(`  • ${item.name} x${item.quantity} - Rs. ${(item.price * item.quantity).toFixed(2)}`, margin + 5, yPos);
          yPos += 5;
          checkPageBreak(10);
        });

        doc.setFont('helvetica', 'bold');
        doc.text(`Total: Rs. ${order.totalAmount.toFixed(2)}`, margin + 5, yPos);
        yPos += 8;

        // Separator line
        if (index < salesData.orders.length - 1) {
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 5;
        }
      });
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        `Generated on ${new Date().toLocaleString('en-IN')}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' }
      );
    }

    // Save PDF
    const fileName = `sales-report-${monthName.toLowerCase()}-${year}.pdf`;
    doc.save(fileName);
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Typography variant="h4" className="font-bold mb-6">
        Sales Report
      </Typography>

      <Box 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 4,
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <FormControl 
          sx={{
            minWidth: { xs: '100%', sm: 120 },
          }}
        >
          <InputLabel id="year-select-label" shrink={!!year}>
            Year
          </InputLabel>
          <Select
            labelId="year-select-label"
            value={year}
            onChange={(e) => setYear(e.target.value as number)}
            label="Year"
            notched={!!year}
          >
            {years.map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl 
          sx={{
            minWidth: { xs: '100%', sm: 150 },
          }}
        >
          <InputLabel id="month-select-label" shrink={!!month}>
            Month
          </InputLabel>
          <Select
            labelId="month-select-label"
            value={month}
            onChange={(e) => setMonth(e.target.value as number)}
            label="Month"
            notched={!!month}
          >
            {months.map(m => (
              <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {salesData && (
          <Button
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faDownload} />}
            onClick={() => handleDownloadPDF('monthly')}
            sx={{
              minWidth: { xs: '100%', sm: 'auto' },
              whiteSpace: 'nowrap',
            }}
          >
            Download PDF Report
          </Button>
        )}
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : salesData ? (
        <>
          <Paper 
            className="mb-6"
            sx={{
              p: { xs: 3, sm: 6 },
            }}
          >
            <Box 
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 3,
              }}
            >
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 3,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(37, 99, 235, 0.15)' 
                    : '#eff6ff',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.3)' : 'transparent'}`,
                }}
              >
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Total Sales
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.mode === 'dark' ? '#60a5fa' : '#2563eb',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                  }}
                >
                  ₹{salesData.totalSales}
                </Typography>
              </Box>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 3,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(22, 163, 74, 0.15)' 
                    : '#f0fdf4',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(22, 163, 74, 0.3)' : 'transparent'}`,
                }}
              >
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Total Orders
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.mode === 'dark' ? '#4ade80' : '#16a34a',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                  }}
                >
                  {salesData.orderCount}
                </Typography>
              </Box>
              <Box 
                sx={{
                  textAlign: 'center',
                  p: 3,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(147, 51, 234, 0.15)' 
                    : '#faf5ff',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(147, 51, 234, 0.3)' : 'transparent'}`,
                }}
              >
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Average Order Value
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.mode === 'dark' ? '#a78bfa' : '#9333ea',
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                  }}
                >
                  ₹{salesData.orderCount > 0 ? Math.round(salesData.totalSales / salesData.orderCount) : 0}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Box 
            className="mb-4"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            sx={{
              touchAction: 'pan-x pan-y',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            <Tabs 
              value={viewMode} 
              onChange={(_, newValue) => setViewMode(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                },
              }}
            >
              <Tab 
                value="chart" 
                label="Chart View"
                sx={{
                  minWidth: { xs: 'auto', sm: '120px' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              />
              <Tab 
                value="table" 
                label="Table View"
                sx={{
                  minWidth: { xs: 'auto', sm: '120px' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              />
              <Tab 
                value="dailySummary" 
                label="Daily Summary"
                sx={{
                  minWidth: { xs: 'auto', sm: '120px' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              />
              <Tab 
                value="transactions" 
                label="All Transactions"
                sx={{
                  minWidth: { xs: 'auto', sm: '120px' },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              />
            </Tabs>
          </Box>

          {viewMode === 'chart' && chartData && (
            <Paper 
              className="mb-6"
              sx={{
                p: { xs: 2, sm: 6 },
                overflowX: 'auto',
                touchAction: 'pan-x pan-y',
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <Box sx={{ minWidth: { xs: '100%', sm: '600px' }, height: { xs: '300px', sm: '400px' } }}>
                <Bar data={chartData} options={chartOptions} />
              </Box>
            </Paper>
          )}

          {viewMode === 'table' && salesData && (
            <Paper 
              className="mb-6"
              sx={{
                p: { xs: 2, sm: 6 },
                touchAction: 'pan-x pan-y',
              }}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                }}
              >
                <Typography variant="h6">
                  Daily Sales Table
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FontAwesomeIcon icon={faDownload} />}
                  onClick={() => handleDownloadPDF('monthly')}
                >
                  Download PDF
                </Button>
              </Box>
              <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Day</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Orders</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Total Sales</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.dailyTransactions.length > 0 ? (
                      salesData.dailyTransactions.map((day: any, index: number) => {
                        const date = new Date(day.date);
                        const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
                        
                        return (
                          <TableRow 
                            key={index}
                            sx={{
                              '&:nth-of-type(odd)': {
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.03)' 
                                  : 'rgba(0, 0, 0, 0.02)',
                              },
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark'
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(239, 68, 68, 0.05)',
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {date.toLocaleDateString('en-IN', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" color="text.secondary">
                                {dayName}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {day.orderCount}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                ₹{day.totalAmount.toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No data available for this month
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {salesData.dailyTransactions.length > 0 && (
                      <TableRow 
                        sx={{
                          backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(239, 68, 68, 0.1)',
                          '& .MuiTableCell-root': {
                            fontWeight: 700,
                            fontSize: '1rem',
                          },
                        }}
                      >
                        <TableCell colSpan={2}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            TOTAL
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {salesData.orderCount}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            ₹{salesData.totalSales.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {viewMode === 'dailySummary' && (
            <Paper 
              className="mb-6"
              sx={{
                p: { xs: 2, sm: 6 },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                }}
              >
                <Typography variant="h6">
                  Daily Summary
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FontAwesomeIcon icon={faDownload} />}
                  onClick={() => handleDownloadPDF('monthly')}
                >
                  Download PDF
                </Button>
              </Box>
              <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', touchAction: 'pan-x' }}>
                <Table size="small" sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Orders</TableCell>
                      <TableCell align="right">Total Sales</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salesData.dailyTransactions.length > 0 ? (
                      salesData.dailyTransactions.map((day: any, index: number) => {
                        const dateStr = day.date;
                        const isExpanded = expandedDate === dateStr;
                        const dayOrders = salesData.orders?.filter((order: any) => {
                          const orderDate = new Date(order.date).toISOString().split('T')[0];
                          return orderDate === dateStr;
                        }) || [];

                        return (
                          <React.Fragment key={index}>
                            <TableRow 
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                              }}
                              onClick={() => setExpandedDate(isExpanded ? null : dateStr)}
                            >
                              <TableCell>
                                <Typography variant="body1" className="font-medium">
                                  {new Date(day.date).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body1" className="font-medium">
                                  {day.orderCount}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body1" className="font-bold text-primary-600">
                                  ₹{day.totalAmount}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedDate(isExpanded ? null : dateStr);
                                  }}
                                >
                                  {isExpanded ? 'Hide' : 'View'} Orders
                                </Button>
                              </TableCell>
                            </TableRow>
                            {isExpanded && dayOrders.length > 0 && (
                              <TableRow>
                                <TableCell 
                                  colSpan={4} 
                                  sx={{ 
                                    padding: 0, 
                                    backgroundColor: theme.palette.mode === 'dark' 
                                      ? 'rgba(255, 255, 255, 0.03)' 
                                      : '#f9fafb' 
                                  }}
                                >
                                  <Box className="p-4">
                                    <Typography variant="subtitle2" className="mb-3 font-bold">
                                      Orders for {new Date(day.date).toLocaleDateString()}
                                    </Typography>
                                    <Table size="small">
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Order Number</TableCell>
                                          <TableCell>Time</TableCell>
                                          <TableCell>Items</TableCell>
                                          <TableCell align="right">Amount</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                        {dayOrders.map((order: any) => (
                                          <TableRow key={order._id}>
                                            <TableCell>
                                              <Typography variant="body2" className="font-mono">
                                                {order.orderNumber}
                                              </Typography>
                                            </TableCell>
                                            <TableCell>
                                              {new Date(order.date).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                              })}
                                            </TableCell>
                                            <TableCell>
                                              {order.items.map((item: any, idx: number) => (
                                                <Typography key={idx} variant="body2" color="text.secondary">
                                                  {item.name} x{item.quantity}
                                                </Typography>
                                              ))}
                                            </TableCell>
                                            <TableCell align="right">
                                              <Typography variant="body2" className="font-bold">
                                                ₹{order.totalAmount}
                                              </Typography>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No transactions found for this month
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {viewMode === 'transactions' && salesData.orders && (
            <Paper
              sx={{
                p: { xs: 2, sm: 6 },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                }}
              >
                <Typography variant="h6">
                  All Daily Transactions
                  {sortedOrders && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1, fontWeight: 400 }}>
                      ({Math.min(transactionsToShow, sortedOrders.length)} of {sortedOrders.length})
                    </Typography>
                  )}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<FontAwesomeIcon icon={faTrash} />}
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete Transactions
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FontAwesomeIcon icon={faDownload} />}
                    onClick={() => handleDownloadPDF('monthly')}
                  >
                    Download PDF
                  </Button>
                </Box>
              </Box>
              <TableContainer 
                sx={{ 
                  maxWidth: '100%', 
                  overflowX: 'auto', 
                  touchAction: 'pan-x',
                  scrollBehavior: 'smooth',
                  maxHeight: { xs: '70vh', sm: '80vh' },
                  overflowY: 'auto',
                }}
              >
                <Table size="small" sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order Number</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            cursor: 'pointer',
                            userSelect: 'none',
                            '&:hover': {
                              opacity: 0.8,
                            },
                          }}
                          onClick={handleSortToggle}
                        >
                          Date & Time
                          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
                            <FontAwesomeIcon
                              icon={faSortUp}
                              style={{
                                fontSize: '10px',
                                color: sortOrder === 'asc' 
                                  ? theme.palette.primary.main 
                                  : theme.palette.text.disabled,
                                marginBottom: '-2px',
                              }}
                            />
                            <FontAwesomeIcon
                              icon={faSortDown}
                              style={{
                                fontSize: '10px',
                                color: sortOrder === 'desc' 
                                  ? theme.palette.primary.main 
                                  : theme.palette.text.disabled,
                                marginTop: '-2px',
                              }}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell align="right">Total Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedOrders.length > 0 ? (
                      <>
                        {sortedOrders.slice(0, transactionsToShow).map((order: any, index: number) => {
                          // Only animate newly loaded items
                          const isNewlyLoaded = newlyLoadedIndices.has(index);
                          const animationIndex = Array.from(newlyLoadedIndices).indexOf(index);
                          return (
                          <TableRow 
                            key={order._id || order.orderNumber}
                            sx={{
                              ...(isNewlyLoaded && {
                                animation: 'fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                animationDelay: `${Math.min(animationIndex * 0.05, 0.25)}s`,
                                animationFillMode: 'both',
                                '@keyframes fadeInUp': {
                                  from: {
                                    opacity: 0,
                                    transform: 'translateY(20px)',
                                  },
                                  to: {
                                    opacity: 1,
                                    transform: 'translateY(0)',
                                  },
                                },
                              }),
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark'
                                  ? 'rgba(255, 255, 255, 0.05)'
                                  : 'rgba(0, 0, 0, 0.02)',
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" className="font-mono">
                                {order.orderNumber}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(order.date).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box>
                                {order.items.slice(0, 2).map((item: any, idx: number) => (
                                  <Typography key={idx} variant="body2" color="text.secondary">
                                    {item.name} x{item.quantity}
                                  </Typography>
                                ))}
                                {order.items.length > 2 && (
                                  <Typography variant="body2" color="text.secondary">
                                    +{order.items.length - 2} more items
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body1" className="font-bold text-primary-600">
                                ₹{order.totalAmount}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          );
                        })}
                        {/* Observer target for infinite scroll - only show if there are more transactions */}
                        {(() => {
                          const hasMoreTransactions = sortedOrders && 
                                                       Array.isArray(sortedOrders) && 
                                                       sortedOrders.length > 0 && 
                                                       transactionsToShow < sortedOrders.length;
                          
                          return hasMoreTransactions ? (
                            <TableRow>
                              <TableCell 
                                colSpan={4} 
                                ref={observerTarget} 
                                sx={{ 
                                  p: 3, 
                                  textAlign: 'center',
                                  animation: 'pulse 2s infinite',
                                  '@keyframes pulse': {
                                    '0%, 100%': {
                                      opacity: 0.6,
                                    },
                                    '50%': {
                                      opacity: 1,
                                    },
                                  },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                  <Box
                                    sx={{
                                      width: 16,
                                      height: 16,
                                      border: '2px solid',
                                      borderColor: 'primary.main',
                                      borderTopColor: 'transparent',
                                      borderRadius: '50%',
                                      animation: 'spin 1s linear infinite',
                                      '@keyframes spin': {
                                        '0%': {
                                          transform: 'rotate(0deg)',
                                        },
                                        '100%': {
                                          transform: 'rotate(360deg)',
                                        },
                                      },
                                    }}
                                  />
                                  <Typography variant="body2" color="text.secondary">
                                    Loading more transactions...
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ) : null;
                        })()}
                        {/* Show completion message only when all transactions are loaded and there are more than 5 */}
                        {sortedOrders && 
                         Array.isArray(sortedOrders) && 
                         sortedOrders.length > 0 && 
                         transactionsToShow >= sortedOrders.length && 
                         sortedOrders.length > 5 && (
                          <TableRow>
                            <TableCell colSpan={4} sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                All transactions loaded ({sortedOrders.length} total)
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No transactions found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      ) : (
        <Typography>No data available for selected month</Typography>
      )}

      {/* Delete Transactions Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Transactions</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Select a date range or month range to delete transactions. This action cannot be undone.
          </DialogContentText>
          
          <FormControl component="fieldset" sx={{ mb: 3 }}>
            <FormLabel component="legend">Select Range Type</FormLabel>
            <RadioGroup
              value={deleteRangeType}
              onChange={(e) => setDeleteRangeType(e.target.value as 'month' | 'date')}
              row
            >
              <FormControlLabel value="month" control={<Radio />} label="Month Range" />
              <FormControlLabel value="date" control={<Radio />} label="Date Range" />
            </RadioGroup>
          </FormControl>

          {deleteRangeType === 'month' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2">From Month</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="start-month-label">Month</InputLabel>
                  <Select
                    labelId="start-month-label"
                    value={startMonth}
                    label="Month"
                    onChange={(e) => setStartMonth(Number(e.target.value))}
                  >
                    {months.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="start-year-label">Year</InputLabel>
                  <Select
                    labelId="start-year-label"
                    value={startYear}
                    label="Year"
                    onChange={(e) => setStartYear(Number(e.target.value))}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Typography variant="subtitle2">To Month</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="end-month-label">Month</InputLabel>
                  <Select
                    labelId="end-month-label"
                    value={endMonth}
                    label="Month"
                    onChange={(e) => setEndMonth(Number(e.target.value))}
                  >
                    {months.map((m) => (
                      <MenuItem key={m.value} value={m.value}>
                        {m.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="end-year-label">Year</InputLabel>
                  <Select
                    labelId="end-year-label"
                    value={endYear}
                    label="Year"
                    onChange={(e) => setEndYear(Number(e.target.value))}
                  >
                    {years.map((y) => (
                      <MenuItem key={y} value={y}>
                        {y}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setDeleteConfirmOpen(true);
            }}
            variant="contained"
            color="error"
            disabled={
              deleteRangeType === 'month'
                ? false
                : !startDate || !endDate || new Date(startDate) > new Date(endDate)
            }
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteRangeType === 'month' ? (
              <>
                Are you sure you want to delete all transactions from{' '}
                <strong>
                  {months.find((m) => m.value === startMonth)?.label} {startYear}
                </strong>{' '}
                to{' '}
                <strong>
                  {months.find((m) => m.value === endMonth)?.label} {endYear}
                </strong>
                ? This action cannot be undone.
              </>
            ) : (
              <>
                Are you sure you want to delete all transactions from{' '}
                <strong>{new Date(startDate).toLocaleDateString()}</strong> to{' '}
                <strong>{new Date(endDate).toLocaleDateString()}</strong>? This action cannot be undone.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleteLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteTransactions}
            variant="contained"
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SalesReport;

