import { memo } from 'react';
import { MenuItem as MenuItemType } from '../../types';
import { cartStorage } from '../../utils/localStorage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, CardMedia, Typography, IconButton, Box, Chip, useTheme } from '@mui/material';

interface MenuItemProps {
  item: MenuItemType;
  quantity: number;
  onQuantityChange: () => void;
}

const MenuItem = memo(({ item, quantity, onQuantityChange }: MenuItemProps) => {
  const theme = useTheme();
  
  const handleAdd = () => {
    cartStorage.addItem(item);
    onQuantityChange();
  };

  const handleIncrease = () => {
    cartStorage.updateQuantity(item.id, quantity + 1);
    onQuantityChange();
  };

  const handleDecrease = () => {
    cartStorage.updateQuantity(item.id, quantity - 1);
    onQuantityChange();
  };

  return (
    <Card 
      className="h-full flex flex-col overflow-hidden cursor-pointer"
      sx={{
        borderRadius: '16px',
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 2px 12px rgba(255,255,255,0.15)' 
          : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        transform: 'translateY(0) scale(1)',
        animation: 'fadeInUp 0.3s ease-out',
        '@keyframes fadeInUp': {
          '0%': {
            opacity: 0,
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 4px 16px rgba(255,255,255,0.2)'
            : '0 4px 12px rgba(0,0,0,0.12)',
        },
        '&:active': {
          transform: 'translateY(0)',
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
            transform: 'scale(1.02)',
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
            transition: 'transform 0.2s ease',
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
            transition: 'all 0.2s ease',
            transform: 'scale(1)',
            animation: 'fadeIn 0.2s ease-out 0.1s both',
            '@keyframes fadeIn': {
              '0%': {
                opacity: 0,
              },
              '100%': {
                opacity: 1,
              },
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
            transition: 'color 0.2s ease',
            animation: 'fadeIn 0.2s ease-out 0.1s both',
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

        {/* Bottom Section - Price and Add Button */}
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

          {/* Add/Quantity Controls */}
          {quantity === 0 ? (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                handleAdd();
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '6px',
                padding: '8px 24px',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                fontWeight: 600,
                fontSize: '14px',
                '&:hover': {
                  backgroundColor: '#dc2626',
                },
              }}
            >
              <FontAwesomeIcon icon={faPlus} style={{ fontSize: '14px', marginRight: '6px' }} />
              ADD
            </Box>
          ) : (
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#ef4444',
                borderRadius: '6px',
                padding: '6px 12px',
              }}
            >
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDecrease();
                }}
                sx={{
                  color: 'white',
                  padding: '4px',
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                <FontAwesomeIcon icon={faMinus} style={{ fontSize: '14px' }} />
              </IconButton>
              <Typography 
                variant="body1" 
                sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '16px',
                  minWidth: '24px',
                  textAlign: 'center',
                }}
              >
                {quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleIncrease();
                }}
                sx={{
                  color: 'white',
                  padding: '4px',
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  },
                }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ fontSize: '14px' }} />
              </IconButton>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
});

MenuItem.displayName = 'MenuItem';

export default MenuItem;

