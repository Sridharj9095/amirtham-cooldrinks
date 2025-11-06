import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItem as MenuItemType } from '../../types';
import { menuStorage, cartStorage, categoryStorage } from '../../utils/localStorage';
import { menuItemsAPI } from '../../utils/api';
import MenuItem from './MenuItem';
import { TextField, Container, Grid, Box, Fab, Badge, Typography, Button, InputAdornment, IconButton, useTheme, Chip, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faTimes } from '@fortawesome/free-solid-svg-icons';
import { initScrollAnimations } from '../../utils/scrollAnimation';

const Menu = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [cartItems, setCartItems] = useState(cartStorage.getItems());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cartCount, setCartCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsToShow, setItemsToShow] = useState(12); // Initial number of items to show
  const observerTarget = useRef<HTMLDivElement | null>(null);
  const loadingMore = useRef(false);

  useEffect(() => {
    // Load menu items from MongoDB API
    const loadMenuItems = async () => {
      try {
        setIsLoading(true);
        console.log('Loading menu items from MongoDB...');
        
        // Fetch from MongoDB API
        const items = await menuItemsAPI.getAll();
        console.log('Loaded items from MongoDB:', items.length);
        
        if (items.length > 0) {
          setMenuItems(items);
          // Update categories from fetched items
          const uniqueCategories = [...new Set(items.map(item => item.category))];
          uniqueCategories.forEach(cat => categoryStorage.addCategory(cat));
        } else {
          // If no items in database, try localStorage as emergency fallback
          const localItems = menuStorage.getItems();
          if (localItems.length > 0) {
            console.warn('⚠️ No items in MongoDB, using localStorage as fallback:', localItems.length);
            setMenuItems(localItems);
          } else {
            console.warn('⚠️ No menu items found. Please run migration script or add items through Menu Management.');
            setMenuItems([]);
          }
        }
        
        setIsLoading(false);
        initScrollAnimations();
      } catch (error: any) {
        console.error('Error loading menu items from MongoDB:', error);
        // Emergency fallback to localStorage only
        try {
          const items = menuStorage.getItems();
          if (items.length > 0) {
            console.warn('⚠️ MongoDB unavailable, using localStorage as fallback:', items.length);
            setMenuItems(items);
          } else {
            console.error('❌ No menu items available. MongoDB connection failed and localStorage is empty.');
            setMenuItems([]);
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
          setMenuItems([]);
        }
        setIsLoading(false);
        initScrollAnimations();
      }
    };
    
    loadMenuItems();
  }, []);

  useEffect(() => {
    const updateCart = () => {
      const items = cartStorage.getItems();
      setCartItems(items);
      setCartCount(cartStorage.getTotalItems());
    };
    updateCart();
    const interval = setInterval(updateCart, 100);
    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(() => {
    // Get unique categories from menu items
    const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
    return ['All', ...uniqueCategories];
  }, [menuItems]);

  const filteredItems = useMemo(() => {
    const filtered = menuItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    console.log('Filtering items:', {
      totalItems: menuItems.length,
      selectedCategory,
      filteredCount: filtered.length,
      searchQuery
    });
    return filtered;
  }, [menuItems, searchQuery, selectedCategory]);

  // Reset items to show when filters change
  useEffect(() => {
    setItemsToShow(12);
  }, [searchQuery, selectedCategory]);

  // Items to display (limited by itemsToShow)
  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, itemsToShow);
  }, [filteredItems, itemsToShow]);

  // Load more items when scrolling
  const loadMoreItems = useCallback(() => {
    if (loadingMore.current || itemsToShow >= filteredItems.length) {
      return;
    }
    
    loadingMore.current = true;
    // Load 12 more items
    setItemsToShow(prev => Math.min(prev + 12, filteredItems.length));
    
    // Small delay to prevent rapid firing
    setTimeout(() => {
      loadingMore.current = false;
    }, 300);
  }, [itemsToShow, filteredItems.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && itemsToShow < filteredItems.length) {
          loadMoreItems();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [itemsToShow, filteredItems.length, loadMoreItems]);

  const getQuantity = (itemId: string) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleQuantityChange = () => {
    setCartItems(cartStorage.getItems());
    setCartCount(cartStorage.getTotalItems());
  };

  return (
    <Container maxWidth="lg" className="py-8">
      <Box className="mb-6">
        <Typography 
          variant="h3" 
          component="h1"
          sx={{ 
            textAlign: 'center', 
            mb: 4, 
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          Our Menu
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
          InputProps={{
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={() => setSearchQuery('')}
                  edge="end"
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          {categories.map(category => (
            <Chip
              key={category}
              label={category}
              onClick={() => {
                console.log('Category clicked:', category);
                setSelectedCategory(category);
              }}
              sx={{
                backgroundColor: selectedCategory === category
                  ? theme.palette.primary.main
                  : theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.08)',
                color: selectedCategory === category
                  ? 'white'
                  : theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: selectedCategory === category
                    ? theme.palette.primary.dark
                    : theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.15)'
                      : 'rgba(0, 0, 0, 0.12)',
                },
                fontWeight: selectedCategory === category ? 600 : 500,
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>
        
        {selectedCategory !== 'All' && (
          <Box className="mb-4">
            <Typography variant="body2" color="text.secondary">
              Showing {displayedItems.length} of {filteredItems.length} item(s) in "{selectedCategory}"
            </Typography>
          </Box>
        )}
        
        {selectedCategory === 'All' && filteredItems.length > 12 && (
          <Box className="mb-4">
            <Typography variant="body2" color="text.secondary">
              Showing {displayedItems.length} of {filteredItems.length} items
            </Typography>
          </Box>
        )}
      </Box>

      {filteredItems.length > 0 && (
        <>
          <Grid container spacing={3}>
            {displayedItems.map((item, index) => {
              console.log('Rendering item:', item.name, item.id);
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <MenuItem
                    item={item}
                    quantity={getQuantity(item.id)}
                    onQuantityChange={handleQuantityChange}
                  />
                </Grid>
              );
            })}
          </Grid>
          
          {/* Observer target for infinite scroll */}
          {itemsToShow < filteredItems.length && (
            <Box
              ref={observerTarget}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                py: 4,
                mt: 2,
                gap: 2,
              }}
            >
              <CircularProgress size={40} sx={{ color: theme.palette.primary.main }} />
              <Typography variant="body2" color="text.secondary">
                Loading more items...
              </Typography>
            </Box>
          )}
        </>
      )}

      {filteredItems.length === 0 && menuItems.length > 0 && (
        <Box className="text-center py-12">
          <Typography variant="h6" color="text.secondary">
            No items found matching your search. Try a different search term.
          </Typography>
        </Box>
      )}
      
      {menuItems.length === 0 && !isLoading && (
        <Box className="text-center py-12">
          <Typography variant="h6" color="text.secondary" className="mb-4">
            No menu items available.
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mb-4">
            Please run the migration script or add items through Menu Management.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/manage-menu')}
          >
            Go to Menu Management
          </Button>
        </Box>
      )}
      
      {isLoading && (
        <Box className="text-center py-12">
          <Typography variant="h6" color="text.secondary">
            Loading menu items...
          </Typography>
        </Box>
      )}

      {cartCount > 0 && (
        <Fab
          color="primary"
          aria-label="cart"
          className="fixed bottom-8 right-8 z-50"
          onClick={() => navigate('/cart')}
        >
          <Badge badgeContent={cartCount} color="error">
            <FontAwesomeIcon icon={faShoppingCart} className="text-white" />
          </Badge>
        </Fab>
      )}
    </Container>
  );
};

export default Menu;

