import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { catalogCategories, categoryImages } from '../data/catalog';

const StoreContext = createContext();

const getProductImage = (category, index) => {
  const images = categoryImages[category] || categoryImages.Electronics;
  const baseImage = images[index % images.length];
  return `${baseImage}&product=${index + 1}`;
};

const generateInitialMockData = () => {
  const productNames = ['Aero', 'Nova', 'Orbit', 'Pulse', 'Vertex', 'Lumen', 'Atlas', 'Echo', 'Flux', 'Zenith'];
  const productTypes = {
    Electronics: ['Smartwatch', 'Headphones'], Footwear: ['Running Shoes', 'Trail Sneakers'],
    Furniture: ['Office Chair', 'Standing Desk'], Accessories: ['Leather Wallet', 'Travel Pack'],
    'Home & Kitchen': ['Coffee Set', 'Cookware'], Beauty: ['Skin Set', 'Care Kit'],
    Sports: ['Training Ball', 'Yoga Mat'], Books: ['Design Guide', 'Field Notes'],
    Toys: ['Building Set', 'Puzzle Box'], Garden: ['Planter Set', 'Garden Tools'],
    Travel: ['Carry On', 'Travel Kit'], 'Pet Supplies': ['Pet Bed', 'Feeding Set']
  };

  const initialProducts = Array.from({ length: 120 }, (_, index) => {
    const category = catalogCategories[index % catalogCategories.length];
    const name = `${productNames[index % productNames.length]} ${productTypes[category][index % productTypes[category].length]}`;
    return {
      id: `PROD-${String(index + 1).padStart(3, '0')}`,
      name,
      category,
      price: 35 + ((index * 29) % 310),
      stock: index % 9 === 0 ? 7 : 18 + ((index * 13) % 120),
      salesCount: 20 + ((index * 37) % 430),
      image: getProductImage(category, index),
      reviews: index % 3 === 0 ? [{ customerName: 'Maya Patel', rating: 5, comment: 'Excellent quality and fast delivery.' }] : []
    };
  });

  const statuses = ['Delivered', 'Processing', 'Shipped', 'Cancelled'];
  const customers = ['Jordan Lee', 'Maya Patel', 'Alex Johnson', 'Morgan Brown', 'Sam Davis', 'Taylor Wilson', 'Casey Kim', 'Riley Smith'];
  const initialOrders = Array.from({ length: 160 }, (_, index) => {
    const product = initialProducts[(index * 7) % initialProducts.length];
    const quantity = (index % 3) + 1;
    const month = index % 12;
    const date = new Date(2026, month, (index % 25) + 1).toISOString().split('T')[0];
    return {
      id: `ORD-${1000 + index}`,
      customerName: customers[index % customers.length],
      customerEmail: `sample${index % customers.length}@shopmetrics.test`,
      productName: product.name,
      category: product.category,
      quantity,
      totalAmount: product.price * quantity,
      status: statuses[index % statuses.length],
      date
    };
  });

  return { initialProducts, initialOrders };
};

const getMerchantStorageKey = (type, email) => `sm_${type}_${email}`;

const getDataOwnerEmail = (account) => account?.role === 'customer' ? account.merchantEmail : account?.email;

const getDefaultMerchantEmail = () => {
  const registeredMerchants = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
  return registeredMerchants[0]?.email || 'admin@shop.com';
};

const ensureSampleData = (data) => {
  const sampleData = generateInitialMockData();
  const hasStableImages = data.products.length >= 120 && data.products.every(product => product.image && product.image.includes('images.unsplash.com') && !product.image.includes('picsum.photos')) && new Set(data.products.map(product => product.image)).size === data.products.length;
  const normalizedProducts = data.products.length >= 120
    ? (hasStableImages ? data.products : data.products.map((product, index) => ({ ...product, image: getProductImage(product.category, index) })))
    : data.products;
  if (normalizedProducts.length >= 120 && data.orders.length >= 100) return { products: normalizedProducts, orders: data.orders };
  const productIds = new Set(normalizedProducts.map(product => product.id));
  const orderIds = new Set(data.orders.map(order => order.id));
  return {
    products: [...normalizedProducts, ...sampleData.initialProducts.filter(product => !productIds.has(product.id))],
    orders: [...data.orders, ...sampleData.initialOrders.filter(order => !orderIds.has(order.id))]
  };
};

const loadMerchantData = (email) => {
  const savedProducts = localStorage.getItem(getMerchantStorageKey('products', email));
  const savedOrders = localStorage.getItem(getMerchantStorageKey('orders', email));

  if (savedProducts || savedOrders) {
    return ensureSampleData({
      products: savedProducts ? JSON.parse(savedProducts) : [],
      orders: savedOrders ? JSON.parse(savedOrders) : []
    });
  }

  if (email === 'admin@shop.com') {
    const legacyProducts = localStorage.getItem('sm_products');
    const legacyOrders = localStorage.getItem('sm_orders');
    if (legacyProducts || legacyOrders) {
      return ensureSampleData({
        products: legacyProducts ? JSON.parse(legacyProducts) : [],
        orders: legacyOrders ? JSON.parse(legacyOrders) : []
      });
    }
    const { initialProducts, initialOrders } = generateInitialMockData();
    return { products: initialProducts, orders: initialOrders };
  }

  return generateInitialMockData();
};

export function StoreProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('sm_current_user');
    if (!savedUser) return null;
    const parsedUser = JSON.parse(savedUser);
    return { ...parsedUser, role: parsedUser.role || 'merchant' };
  });
  const [initialMerchantData] = useState(() => {
    const dataOwnerEmail = getDataOwnerEmail(user);
    return dataOwnerEmail ? loadMerchantData(dataOwnerEmail) : { products: [], orders: [] };
  });
  const [products, setProducts] = useState(initialMerchantData.products);
  const [orders, setOrders] = useState(initialMerchantData.orders);
  const [isMerchantDataLoaded, setIsMerchantDataLoaded] = useState(Boolean(user));
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('sm_theme') || 'dark');
  const dataOwnerEmail = getDataOwnerEmail(user);

  const toggleTheme = () => {
    setTheme(previousTheme => {
      const nextTheme = previousTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('sm_theme', nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    if (!dataOwnerEmail || !isMerchantDataLoaded) return;
    localStorage.setItem(getMerchantStorageKey('products', dataOwnerEmail), JSON.stringify(products));
  }, [products, dataOwnerEmail, isMerchantDataLoaded]);

  useEffect(() => {
    if (!dataOwnerEmail || !isMerchantDataLoaded) return;
    localStorage.setItem(getMerchantStorageKey('orders', dataOwnerEmail), JSON.stringify(orders));
  }, [orders, dataOwnerEmail, isMerchantDataLoaded]);

  useEffect(() => {
    if (!dataOwnerEmail) return undefined;

    const handleSharedDataUpdate = (event) => {
      if (event.key === getMerchantStorageKey('products', dataOwnerEmail) && event.newValue) {
        setProducts(JSON.parse(event.newValue));
      }
      if (event.key === getMerchantStorageKey('orders', dataOwnerEmail) && event.newValue) {
        setOrders(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handleSharedDataUpdate);
    return () => window.removeEventListener('storage', handleSharedDataUpdate);
  }, [dataOwnerEmail]);

  // 3. Analytics Computations Engine
  const financialMetrics = useMemo(() => {
    const activeOrders = orders.filter(order => order.status !== 'Cancelled');
    const totalRevenue = activeOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrdersCount = activeOrders.length;
    const averageOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(2) : '0.00';
    const lowStockCount = products.filter(p => p.stock < 15).length;

    const monthlyDataMap = orders.reduce((acc, order) => {
      if (order.status === 'Cancelled') return acc;
      const month = new Date(order.date).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + order.totalAmount;
      return acc;
    }, {});

    const monthsOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = Object.keys(monthlyDataMap).map(month => ({
      name: month,
      Revenue: monthlyDataMap[month]
    })).sort((a, b) => monthsOrder.indexOf(a.name) - monthsOrder.indexOf(b.name));

    return {
      totalRevenue,
      averageOrderValue,
      totalOrdersCount,
      lowStockCount,
      chartData
    };
  }, [orders, products]);

  // Authentication Handlers
  const activateUser = (account) => {
    const merchantData = loadMerchantData(getDataOwnerEmail(account));
    setProducts(merchantData.products);
    setOrders(merchantData.orders);
    setIsMerchantDataLoaded(true);
    setUser(account);
    localStorage.setItem('sm_current_user', JSON.stringify(account));
  };

  const handleLogin = (email, password, accountType = 'merchant') => {
    if (accountType === 'customer') {
      const savedCustomers = JSON.parse(localStorage.getItem('sm_registered_customers') || '[]');
      const matchedCustomer = savedCustomers.find(customer => customer.email === email && customer.password === password);
      if (!matchedCustomer) return { success: false, error: 'Invalid customer credentials.' };
      activateUser({ ...matchedCustomer, role: 'customer' });
      return { success: true };
    }

    const savedUsers = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
    const matchedUser = savedUsers.find(u => u.email === email && u.password === password);
    
    if (matchedUser) {
      const activeSession = { name: matchedUser.name, email: matchedUser.email, role: 'merchant' };
      activateUser(activeSession);
      return { success: true };
    }
    if (email === 'admin@shop.com' && password === 'admin123') {
      const demoUser = { name: 'Demo Owner', email: 'admin@shop.com', role: 'merchant' };
      activateUser(demoUser);
      return { success: true };
    }
    return { success: false, error: 'Invalid authentication credentials.' };
  };

  const handleRegister = (name, email, password, accountType = 'merchant') => {
    if (accountType === 'customer') {
      const savedCustomers = JSON.parse(localStorage.getItem('sm_registered_customers') || '[]');
      if (savedCustomers.some(customer => customer.email === email)) {
        return { success: false, error: 'Customer email is already registered.' };
      }
      const newCustomer = { name, email, password, merchantEmail: getDefaultMerchantEmail(), role: 'customer' };
      localStorage.setItem('sm_registered_customers', JSON.stringify([...savedCustomers, newCustomer]));
      activateUser(newCustomer);
      return { success: true };
    }

    const savedUsers = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
    if (savedUsers.length > 0) {
      return { success: false, error: 'Only one merchant account is available for this store.' };
    }
    if (savedUsers.some(u => u.email === email)) {
      return { success: false, error: 'Email descriptor already registered.' };
    }
    const updatedUsers = [...savedUsers, { name, email, password }];
    localStorage.setItem('sm_registered_users', JSON.stringify(updatedUsers));
    
    const newUser = { name, email, role: 'merchant' };
    activateUser(newUser);
    return { success: true };
  };

  const handleLogout = () => {
    setUser(null);
    setProducts([]);
    setOrders([]);
    setIsMerchantDataLoaded(false);
    localStorage.removeItem('sm_current_user');
    setActiveTab('Dashboard');
  };

  // Inventory CRUD Array Mutators
  const addProduct = (newProduct) => {
    setProducts(prev => [
      { 
        ...newProduct, 
        id: `PROD-00${prev.length + 1}`, 
        price: Number(newProduct.price), 
        stock: Number(newProduct.stock), 
        salesCount: 0 
      },
      ...prev
    ]);
  };

  const updateProduct = (updatedProduct) => {
    setProducts(prev => prev.map(prod => 
      prod.id === updatedProduct.id 
        ? { 
            ...updatedProduct, 
            price: Number(updatedProduct.price), 
            stock: Number(updatedProduct.stock) 
          } 
        : prod
    ));
  };

  const addProductReview = (productId, review) => {
    setProducts(previousProducts => previousProducts.map(product => product.id === productId
      ? { ...product, reviews: [...(product.reviews || []), review] }
      : product
    ));
  };

  const deleteAccount = () => {
    if (!user) return;
    if (user.role === 'merchant') {
      const users = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
      localStorage.setItem('sm_registered_users', JSON.stringify(users.filter(account => account.email !== user.email)));
      localStorage.removeItem(getMerchantStorageKey('products', user.email));
      localStorage.removeItem(getMerchantStorageKey('orders', user.email));
    } else {
      const customers = JSON.parse(localStorage.getItem('sm_registered_customers') || '[]');
      localStorage.setItem('sm_registered_customers', JSON.stringify(customers.filter(account => account.email !== user.email)));
    }
    handleLogout();
  };

  const updateProfile = (name, email) => {
    if (!user) return;
    const updatedUser = { ...user, name, email };
    setUser(updatedUser);
    localStorage.setItem('sm_current_user', JSON.stringify(updatedUser));
    if (user.role === 'merchant') {
      const users = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
      localStorage.setItem('sm_registered_users', JSON.stringify(users.map(account => account.email === user.email ? { ...account, name, email } : account)));
    } else {
      const customers = JSON.parse(localStorage.getItem('sm_registered_customers') || '[]');
      localStorage.setItem('sm_registered_customers', JSON.stringify(customers.map(account => account.email === user.email ? { ...account, name, email } : account)));
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
  };

  const placeOrder = (cartItems) => {
    if (!user || user.role !== 'customer') return { success: false, error: 'Customer session required.' };

    const unavailableItem = cartItems.find(item => {
      const product = products.find(currentProduct => currentProduct.id === item.id);
      return !product || product.stock < item.quantity;
    });
    if (unavailableItem) return { success: false, error: `${unavailableItem.name} is no longer available in that quantity.` };

    const updatedProducts = products.map(product => {
      const cartItem = cartItems.find(item => item.id === product.id);
      if (!cartItem) return product;
      return {
        ...product,
        stock: product.stock - cartItem.quantity,
        salesCount: product.salesCount + cartItem.quantity
      };
    });
    const orderTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const order = {
      id: `ORD-${Date.now()}`,
      customerName: user.name,
      customerEmail: user.email,
      productName: cartItems.map(item => `${item.name} x${item.quantity}`).join(', '),
      category: cartItems.length === 1 ? cartItems[0].category : 'Multiple categories',
      quantity: cartItems.reduce((total, item) => total + item.quantity, 0),
      totalAmount: orderTotal,
      status: 'Processing',
      date: new Date().toISOString().split('T')[0]
    };

    setProducts(updatedProducts);
    setOrders(previousOrders => [order, ...previousOrders]);
    return { success: true };
  };

  return (
    <StoreContext.Provider value={{
      products,
      orders,
      activeTab,
      setActiveTab,
      theme,
      toggleTheme,
      financialMetrics,
      addProduct,
      updateProduct,
      addProductReview,
      updateOrderStatus,
      placeOrder,
      user,
      handleLogin,
      handleRegister,
      handleLogout,
      deleteAccount,
      updateProfile
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}

