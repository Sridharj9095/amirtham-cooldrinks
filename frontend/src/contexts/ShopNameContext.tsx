import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../utils/api';

interface ShopNameContextType {
  shopName: string;
  loading: boolean;
  refreshShopName: () => Promise<void>;
}

const ShopNameContext = createContext<ShopNameContextType | undefined>(undefined);

export const useShopName = () => {
  const context = useContext(ShopNameContext);
  if (!context) {
    throw new Error('useShopName must be used within a ShopNameProvider');
  }
  return context;
};

interface ShopNameProviderProps {
  children: ReactNode;
}

export const ShopNameProvider: React.FC<ShopNameProviderProps> = ({ children }) => {
  const [shopName, setShopName] = useState<string>('My Restaurant');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchShopName = async () => {
    try {
      const apiUrl = `${getApiBaseUrl()}/settings`;
      const response = await axios.get(apiUrl);
      const name = response.data.shopName || 'My Restaurant';
      setShopName(name);
      // Update document title
      document.title = `${name} - Restaurant Management`;
      // Update localStorage for fallback
      localStorage.setItem('amirtham_shop_name', name);
    } catch (error) {
      // Fallback to localStorage or default
      const storedShopName = localStorage.getItem('amirtham_shop_name');
      const name = storedShopName || 'My Restaurant';
      setShopName(name);
      // Update document title
      document.title = `${name} - Restaurant Management`;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopName();
    
    // Listen for shop name updates
    const handleShopNameUpdate = () => {
      fetchShopName();
    };
    window.addEventListener('shopNameUpdated', handleShopNameUpdate);
    
    return () => {
      window.removeEventListener('shopNameUpdated', handleShopNameUpdate);
    };
  }, []);

  const refreshShopName = async () => {
    await fetchShopName();
  };

  return (
    <ShopNameContext.Provider value={{ shopName, loading, refreshShopName }}>
      {children}
    </ShopNameContext.Provider>
  );
};

