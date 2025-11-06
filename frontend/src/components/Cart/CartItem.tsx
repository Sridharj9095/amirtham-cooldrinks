import { CartItem as CartItemType } from '../../types';
import { cartStorage } from '../../utils/localStorage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, Box, IconButton, Typography, Avatar } from '@mui/material';

interface CartItemProps {
  item: CartItemType;
  onUpdate: () => void;
}

const CartItem = ({ item, onUpdate }: CartItemProps) => {
  const handleIncrease = () => {
    cartStorage.updateQuantity(item.id, item.quantity + 1);
    onUpdate();
  };

  const handleDecrease = () => {
    cartStorage.updateQuantity(item.id, item.quantity - 1);
    onUpdate();
  };

  const handleRemove = () => {
    cartStorage.removeItem(item.id);
    onUpdate();
  };

  return (
    <Card 
      className="mb-4"
      sx={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
        }}
      >
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 3 },
          }}
        >
          {/* Image and Name Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flex: 1,
              width: { xs: '100%', sm: 'auto' },
              minWidth: 0,
            }}
          >
            <Avatar
              src={item.image}
              alt={item.name}
              variant="rounded"
              imgProps={{
                loading: 'lazy',
              }}
              sx={{
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                flexShrink: 0,
              }}
            />
            <Box 
              sx={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <Typography 
                variant="h6" 
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.name}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                }}
              >
                ₹{item.price} each
              </Typography>
            </Box>
          </Box>

          {/* Quantity Controls and Price Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'space-between', sm: 'flex-end' },
              gap: { xs: 2, sm: 2 },
              width: { xs: '100%', sm: 'auto' },
              flexWrap: 'wrap',
            }}
          >
            {/* Quantity Controls */}
            <Box 
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <IconButton
                size="small"
                onClick={handleDecrease}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  width: { xs: '32px', sm: '36px' },
                  height: { xs: '32px', sm: '36px' },
                }}
              >
                <FontAwesomeIcon icon={faMinus} style={{ fontSize: '14px' }} />
              </IconButton>
              <Typography 
                variant="h6" 
                sx={{
                  minWidth: { xs: '32px', sm: '40px' },
                  textAlign: 'center',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                {item.quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={handleIncrease}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  width: { xs: '32px', sm: '36px' },
                  height: { xs: '32px', sm: '36px' },
                }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ fontSize: '14px' }} />
              </IconButton>
            </Box>

            {/* Price */}
            <Typography 
              variant="h6" 
              sx={{
                minWidth: { xs: '80px', sm: '100px' },
                textAlign: { xs: 'right', sm: 'right' },
                fontSize: { xs: '1rem', sm: '1.25rem' },
                fontWeight: 700,
              }}
            >
              ₹{item.price * item.quantity}
            </Typography>

            {/* Delete Button */}
            <IconButton
              color="error"
              onClick={handleRemove}
              size="medium"
              sx={{
                padding: { xs: '6px', sm: '8px' },
              }}
            >
              <FontAwesomeIcon icon={faTrash} style={{ fontSize: '16px' }} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CartItem;

