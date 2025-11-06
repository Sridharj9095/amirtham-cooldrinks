import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { menuStorage } from './utils/localStorage';
import { initialMenuItems } from './data/initialMenuData';
import Menu from './components/Menu/Menu';
import Cart from './components/Cart/Cart';
import Billing from './components/Billing/Billing';
import MenuManagement from './components/MenuManagement/MenuManagement';
import AddMenuItem from './components/MenuManagement/AddMenuItem';
import EditMenuItem from './components/MenuManagement/EditMenuItem';
import SalesReport from './components/Reports/SalesReport';
import Settings from './components/Settings/Settings';
import Navbar from './components/Navbar';
import { useTheme } from '@mui/material/styles';

interface AppProps {
  darkMode: boolean;
  onDarkModeChange: (darkMode: boolean) => void;
}

function App({ darkMode, onDarkModeChange }: AppProps) {
  const theme = useTheme();

  useEffect(() => {
    // Initialize menu items if not already present
    const existingItems = menuStorage.getItems();
    if (existingItems.length === 0) {
      menuStorage.saveItems(initialMenuItems);
    }
  }, []);

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: theme.palette.background.default,
        minHeight: '100vh',
      }}
    >
      <Navbar />
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/manage-menu" element={<MenuManagement />} />
        <Route path="/add-menu-item" element={<AddMenuItem />} />
        <Route path="/edit-menu-item/:id" element={<EditMenuItem />} />
        <Route path="/sales-report" element={<SalesReport />} />
        <Route 
          path="/settings" 
          element={
            <Settings 
              darkMode={darkMode} 
              onDarkModeChange={onDarkModeChange} 
            />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;

