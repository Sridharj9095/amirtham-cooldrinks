import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingCart,
  faHome,
  faUtensils,
  faChartLine,
  faBars,
  faTimes,
  faCog,
} from "@fortawesome/free-solid-svg-icons";
import {
  Badge,
  AppBar,
  Toolbar,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { cartStorage } from "../utils/localStorage";

const Navbar = () => {
  const location = useLocation();
  const theme = useTheme();
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(cartStorage.getTotalItems());
    };
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    const interval = setInterval(updateCartCount, 100);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  const navItems = [
    { path: "/", label: "Menu", icon: faHome },
    { path: "/cart", label: "Cart", icon: faShoppingCart, badge: cartCount },
    { path: "/manage-menu", label: "Manage", icon: faUtensils },
    { path: "/sales-report", label: "Reports", icon: faChartLine },
    { path: "/settings", label: "Settings", icon: faCog },
  ];

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    handleMobileMenuClose();
  };

  return (
    <AppBar 
      position="sticky" 
      className="bg-primary-600"
      sx={{
        // Cool gradient for mobile
        background: {
          xs: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
          md: 'inherit',
        },
        boxShadow: {
          xs: '0 4px 20px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
          md: 'inherit',
        },
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          minHeight: { xs: "64px", sm: "64px" },
          px: { xs: 2, sm: 2 },
          py: { xs: 1, sm: 0 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: 1,
            minWidth: 0,
          }}
        >
          <Link
            to="/"
            className="text-white no-underline"
            style={{ textDecoration: "none" }}
          >
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                m: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textShadow: {
                  xs: '0 2px 4px rgba(0, 0, 0, 0.2)',
                  md: 'none',
                },
                letterSpacing: { xs: '0.5px', md: 'normal' },
              }}
            >
              Amirtham Cooldrinks
            </Typography>
          </Link>
        </Box>

        {/* Desktop Navigation */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 1,
          }}
        >
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              color="inherit"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor:
                  location.pathname === item.path
                    ? "rgba(255, 255, 255, 0.2)"
                    : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
                minHeight: "40px",
                "& .fa-icon": {
                  fontSize: "16px",
                },
              }}
            >
              {item.badge !== undefined ? (
                <Badge
                  badgeContent={item.badge}
                  sx={{
                    "& .MuiBadge-badge": {
                      backgroundColor: "#ff6b35",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      minWidth: "20px",
                      height: "20px",
                      padding: "0 6px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    },
                  }}
                >
                  <FontAwesomeIcon icon={item.icon} className="fa-icon" />
                </Badge>
              ) : (
                <FontAwesomeIcon icon={item.icon} className="fa-icon" />
              )}
              <span>{item.label}</span>
            </Button>
          ))}
        </Box>

        {/* Mobile Menu Button */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            alignItems: "center",
            gap: 1.5,
          }}
        >
          {cartCount > 0 && (
            <Badge
              badgeContent={cartCount}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#ff6b35",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  minWidth: "22px",
                  height: "22px",
                  padding: "0 6px",
                  boxShadow: "0 3px 8px rgba(255, 107, 53, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.2)",
                  animation: cartCount > 0 ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': {
                      transform: 'scale(1)',
                    },
                    '50%': {
                      transform: 'scale(1.1)',
                    },
                  },
                },
              }}
            >
              <IconButton
                component={Link}
                to="/cart"
                color="inherit"
                aria-label="cart"
                size="medium"
                sx={{
                  padding: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    transform: "scale(1.05)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                  "& .fa-icon": {
                    fontSize: "22px",
                  },
                }}
              >
                <FontAwesomeIcon icon={faShoppingCart} className="fa-icon" />
              </IconButton>
            </Badge>
          )}
          <IconButton
            color="inherit"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="open menu"
            size="medium"
            sx={{
              padding: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(10px)",
              borderRadius: "12px",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                transform: "scale(1.05) rotate(90deg)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
              "& .fa-icon": {
                fontSize: "22px",
              },
            }}
          >
            <FontAwesomeIcon icon={faBars} className="fa-icon" />
          </IconButton>
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        PaperProps={{
          sx: {
            width: { xs: '85%', sm: 320 },
            maxWidth: 320,
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
            backgroundImage: isDarkMode 
              ? 'linear-gradient(180deg, #1a1a1a 0%, #1e1e1e 100%)'
              : 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)',
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
          },
        }}
        transitionDuration={300}
      >
        <Box 
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
            },
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                letterSpacing: '0.5px',
              }}
            >
              Menu
            </Typography>
            <IconButton
              onClick={handleMobileMenuClose}
              sx={{
                padding: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                borderRadius: "10px",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  transform: "rotate(90deg) scale(1.1)",
                },
                "& .fa-icon": {
                  fontSize: "20px",
                },
              }}
            >
              <FontAwesomeIcon icon={faTimes} className="fa-icon" />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ p: 2, pt: 3 }}>
          <List sx={{ p: 0 }}>
            {navItems.map((item, index) => (
              <ListItem 
                key={item.path} 
                disablePadding
                sx={{
                  mb: 1.5,
                  animation: `slideIn 0.3s ease ${index * 0.1}s both`,
                  '@keyframes slideIn': {
                    from: {
                      opacity: 0,
                      transform: 'translateX(-20px)',
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateX(0)',
                    },
                  },
                }}
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={handleNavClick}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: "16px",
                    py: 1.5,
                    px: 2,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&.Mui-selected": {
                      backgroundColor: isDarkMode 
                        ? "rgba(239, 68, 68, 0.25)" 
                        : "rgba(239, 68, 68, 0.12)",
                      color: "#ef4444",
                      boxShadow: isDarkMode
                        ? "0 4px 12px rgba(239, 68, 68, 0.3)"
                        : "0 4px 12px rgba(239, 68, 68, 0.2)",
                      transform: "translateX(4px)",
                      "&:hover": {
                        backgroundColor: isDarkMode
                          ? "rgba(239, 68, 68, 0.35)"
                          : "rgba(239, 68, 68, 0.18)",
                        transform: "translateX(4px) scale(1.02)",
                      },
                    },
                    "&:hover": {
                      backgroundColor: isDarkMode
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.04)",
                      transform: "translateX(4px)",
                    },
                    "&:active": {
                      transform: "scale(0.98)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color:
                        location.pathname === item.path 
                          ? "#ef4444" 
                          : isDarkMode 
                            ? "rgba(255, 255, 255, 0.7)" 
                            : "#666",
                      minWidth: 48,
                      justifyContent: "center",
                    }}
                  >
                    {item.badge !== undefined ? (
                      <Badge
                        badgeContent={item.badge}
                        sx={{
                          "& .MuiBadge-badge": {
                            backgroundColor: "#ff6b35",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            minWidth: "20px",
                            height: "20px",
                            padding: "0 5px",
                            boxShadow: "0 2px 6px rgba(255, 107, 53, 0.4)",
                          },
                        }}
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          style={{ fontSize: "22px" }}
                        />
                      </Badge>
                    ) : (
                      <FontAwesomeIcon
                        icon={item.icon}
                        style={{ fontSize: "22px" }}
                      />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path ? 700 : 500,
                      fontSize: "1rem",
                      color:
                        location.pathname === item.path 
                          ? "#ef4444" 
                          : isDarkMode 
                            ? "rgba(255, 255, 255, 0.9)" 
                            : "#333",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
