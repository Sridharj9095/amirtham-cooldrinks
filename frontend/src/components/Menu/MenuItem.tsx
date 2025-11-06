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

const MenuItem = ({ item, quantity, onQuantityChange }: MenuItemProps) => {
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
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontWeight: 600,
                fontSize: '14px',
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
                  transform: 'scale(1.08) translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                  '&::before': {
                    width: '300px',
                    height: '300px',
                  },
                },
                '&:active': {
                  transform: 'scale(0.95) translateY(0)',
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
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                },
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
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.2) rotate(-90deg)',
                  },
                  '&:active': {
                    transform: 'scale(0.9) rotate(-90deg)',
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
                  transition: 'all 0.2s ease',
                  animation: 'pulse 0.3s ease',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      transform: 'scale(1)',
                    },
                    '50%': {
                      transform: 'scale(1.2)',
                    },
                  },
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
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.2) rotate(90deg)',
                  },
                  '&:active': {
                    transform: 'scale(0.9) rotate(90deg)',
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
};

export default MenuItem;

