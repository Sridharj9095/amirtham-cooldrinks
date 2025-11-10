import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItem } from '../../types';
import { menuStorage, categoryStorage } from '../../utils/localStorage';
import { menuItemsAPI } from '../../utils/api';
import { Container, Box, Typography, Button, Card, CardContent, CardMedia, IconButton, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, useTheme } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import AddCategoryDialog from './CategoryManager';

const MenuManagement = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Try to fetch from API first
      const items = await menuItemsAPI.getAll();
      setMenuItems(items);
      
      // Update categories from fetched items
      const uniqueCategories = [...new Set(items.map(item => item.category))];
      uniqueCategories.forEach(cat => categoryStorage.addCategory(cat));
    } catch (error: any) {
      // Fallback to localStorage
      setMenuItems(menuStorage.getItems());
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = menuItems.find(i => i.id === id);
    if (item) {
      setItemToDelete(item);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await menuItemsAPI.delete(itemToDelete.id);
        // Also remove from localStorage as backup
        menuStorage.deleteItem(itemToDelete.id);
        await loadData();
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } catch (error: any) {
        alert(`Failed to delete menu item: ${error.message}`);
        // Still try to remove from localStorage
        menuStorage.deleteItem(itemToDelete.id);
        await loadData();
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleEdit = (id: string) => {
    navigate(`/edit-menu-item/${id}`);
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Box 
        className="mb-6"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'flex-start', sm: 'space-between' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography 
          variant="h4" 
          className="font-bold"
          sx={{
            mb: { xs: 0, sm: 0 },
          }}
        >
          Menu Management
        </Typography>
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            width: { xs: '100%', sm: 'auto' },
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faFolderPlus} />}
            onClick={() => setCategoryDialogOpen(true)}
            fullWidth={false}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: 'auto', sm: '160px' },
              whiteSpace: 'nowrap',
            }}
          >
            Manage Categories
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeIcon icon={faPlus} />}
            onClick={() => navigate('/add-menu-item')}
            fullWidth={false}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: 'auto', sm: '160px' },
              whiteSpace: 'nowrap',
            }}
          >
            Add Menu Item
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {menuItems.map(item => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <Card 
              className="h-full flex flex-col overflow-hidden cursor-pointer"
              sx={{
                borderRadius: '16px',
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 2px 12px rgba(255,255,255,0.15)' 
                  : '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: 'translateY(0) scale(1)',
                animation: 'fadeInUp 0.6s ease-out',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(30px) scale(0.95)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0) scale(1)',
                  },
                },
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.02) rotate(1deg)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 16px 64px rgba(255,255,255,0.4), 0 12px 32px rgba(255,255,255,0.3), 0 8px 16px rgba(255,255,255,0.25), 0 0 0 2px rgba(255,255,255,0.2)'
                    : '0 16px 48px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.15)',
                },
                '&:active': {
                  transform: 'translateY(-4px) scale(0.98)',
                },
              }}
            >
              {/* Image Section */}
              <Box 
                className="relative" 
                sx={{ 
                  position: 'relative', 
                  width: '100%', 
                  paddingTop: '66.67%', 
                  overflow: 'hidden',
                  '&:hover .card-image': {
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="card-image"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'scale(1)',
                  }}
                />
                {/* Category Badge */}
                <Chip
                  label={item.category}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(0, 0, 0, 0.7)' 
                      : 'rgba(255, 255, 255, 0.95)',
                    color: theme.palette.mode === 'dark' 
                      ? '#fff' 
                      : theme.palette.text.primary,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 2px 8px rgba(0,0,0,0.5)'
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'scale(1)',
                    animation: 'slideInRight 0.5s ease-out 0.2s both',
                    '@keyframes slideInRight': {
                      '0%': {
                        opacity: 0,
                        transform: 'translateX(20px) scale(0.8)',
                      },
                      '100%': {
                        opacity: 1,
                        transform: 'translateX(0) scale(1)',
                      },
                    },
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 4px 12px rgba(0,0,0,0.7)'
                        : '0 4px 12px rgba(0,0,0,0.2)',
                    },
                  }}
                />
              </Box>

              {/* Content Section */}
              <CardContent 
                className="flex-grow flex flex-col p-4"
                sx={{ 
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                }}
              >
                {/* Item Name */}
                <Typography 
                  variant="h6" 
                  component="h3" 
                  sx={{
                    fontWeight: 600,
                    fontSize: '18px',
                    lineHeight: 1.4,
                    marginBottom: '8px',
                    color: 'text.primary',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    transition: 'color 0.3s ease',
                    animation: 'fadeIn 0.6s ease-out 0.1s both',
                    '@keyframes fadeIn': {
                      '0%': {
                        opacity: 0,
                      },
                      '100%': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  {item.name}
                </Typography>

                {/* Description */}
                {item.description && (
                  <Typography 
                    variant="body2" 
                    sx={{
                      color: 'text.secondary',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      marginBottom: '12px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flexGrow: 1,
                    }}
                  >
                    {item.description}
                  </Typography>
                )}

                {/* Bottom Section - Price and Action Buttons */}
                <Box 
                  className="flex items-center justify-between mt-auto pt-2"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: '8px',
                    borderTop: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {/* Price */}
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{
                        fontWeight: 700,
                        fontSize: '20px',
                        color: 'text.primary',
                        lineHeight: 1,
                      }}
                    >
                      ₹{item.price}
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  <Box 
                    className="flex gap-2"
                    sx={{
                      display: 'flex',
                      gap: 2,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item.id);
                      }}
                      sx={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '8px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: 0,
                          height: 0,
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.3)',
                          transform: 'translate(-50%, -50%)',
                          transition: 'width 0.6s, height 0.6s',
                        },
                        '&:hover': {
                          backgroundColor: '#dc2626',
                          transform: 'scale(1.15) rotate(5deg)',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                          '&::before': {
                            width: '300px',
                            height: '300px',
                          },
                        },
                        '&:active': {
                          transform: 'scale(0.95) rotate(5deg)',
                        },
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} style={{ fontSize: '14px' }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(item.id, e)}
                      sx={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '8px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: 0,
                          height: 0,
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.3)',
                          transform: 'translate(-50%, -50%)',
                          transition: 'width 0.6s, height 0.6s',
                        },
                        '&:hover': {
                          backgroundColor: '#dc2626',
                          transform: 'scale(1.15) rotate(-5deg)',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                          '&::before': {
                            width: '300px',
                            height: '300px',
                          },
                        },
                        '&:active': {
                          transform: 'scale(0.95) rotate(-5deg)',
                        },
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} style={{ fontSize: '14px' }} />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {menuItems.length === 0 && (
        <Box className="text-center py-12">
          <Typography variant="h6" color="text.secondary">
            No menu items found. Add your first item!
          </Typography>
        </Box>
      )}

      <AddCategoryDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        onUpdate={loadData}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete <strong>"{itemToDelete?.name}"</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MenuManagement;

