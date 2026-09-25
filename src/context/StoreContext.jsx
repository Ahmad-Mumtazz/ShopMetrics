import { useState, useMemo, useEffect } from 'react';
import { StoreContext } from './storeContext';
import { catalogCategories } from '../data/catalog';
import photoCatalog from '../data/photoCatalog.json';
import { createProductDescription, ensureProductDescriptions } from '../data/productDescriptions';
import { createDemoReviews, ensureDemoReviews } from '../data/productReviews';

const catalogImageCategories = {
  Electronics: ['smartphones', 'laptops', 'tablets', 'mobile-accessories', 'mens-watches', 'womens-watches'],
  Footwear: ['mens-shoes', 'womens-shoes'],
  Furniture: ['furniture', 'home-decoration'],
  Accessories: ['sunglasses', 'womens-bags', 'womens-jewellery'],
  'Home & Kitchen': ['kitchen-accessories', 'groceries'],
  Beauty: ['beauty', 'skin-care', 'fragrances'],
  Sports: ['sports-accessories'],
  Garden: ['home-decoration'],
  'Pet Supplies': ['groceries']
};

const catalogImageTitleFilters = {
  Smartwatch: /watch/i,
  Headphones: /airpod|headphone|earphone|beats|echo/i,
  'Running Shoes': /shoe|sneaker/i,
  'Trail Sneakers': /shoe|sneaker/i,
  'Office Chair': /chair|sofa|bed|table/i,
  'Standing Desk': /table|desk|furniture/i,
  'Leather Wallet': /bag|wallet|sunglasses|earring/i,
  'Travel Pack': /bag|backpack/i,
  'Coffee Set': /coffee|cup|mug|glass/i,
  Cookware: /pan|pot|wok|spatula|whisk|sieve|strainer|knife|squeezer/i,
  'Skin Set': /skin|soap|lotion|moisture|mascara|powder/i,
  'Care Kit': /mascara|palette|lipstick|nail|fragrance|eau de/i,
  'Training Ball': /ball|football|basketball|volleyball/i,
  'Yoga Mat': /yoga|fitness|sport/i,
  'Planter Set': /plant|pot|garden/i,
  'Garden Tools': /plant|pot|garden/i,
  'Pet Bed': /dog food|cat food|pet/i,
  'Feeding Set': /dog food|cat food|pet/i
};

const keywordFallbacks = [
  [/smartwatch/i, 'watch'], [/headphones/i, 'headphones'], [/running shoes|trail sneakers/i, 'sneakers'],
  [/office chair/i, 'chair'], [/standing desk/i, 'desk'], [/leather wallet/i, 'wallet'], [/travel pack/i, 'backpack'],
  [/coffee set/i, 'coffee'], [/cookware/i, 'cookware'], [/skin set/i, 'skincare'], [/care kit/i, 'cosmetics'],
  [/training ball/i, 'ball'], [/yoga mat/i, 'yoga'], [/design guide/i, 'book'], [/field notes/i, 'notebook'],
  [/building set/i, 'lego'], [/puzzle box/i, 'puzzle'], [/planter set/i, 'planter'], [/garden tools/i, 'gardening'],
  [/carry on/i, 'suitcase'], [/travel kit/i, 'toiletries'], [/pet bed/i, 'dogbed'], [/feeding set/i, 'petbowl']
];

const getProductImage = (category, index, name = '', usedImages = new Set()) => {
  const categories = catalogImageCategories[category] || [];
  const candidates = photoCatalog.filter(photo => categories.includes(photo.category));
  const titleFilter = catalogImageTitleFilters[name.replace(/^(?:Aero|Nova|Orbit|Pulse|Vertex|Lumen|Atlas|Echo|Flux|Zenith)\s+/, '')];
  const relevant = titleFilter ? candidates.filter(photo => titleFilter.test(photo.title)) : candidates;
  const imagePool = titleFilter ? relevant : candidates;
  const ordinal = Math.floor(Math.max(0, Number(index) || 0) / catalogCategories.length);

  if (imagePool.length) {
    for (let offset = 0; offset < imagePool.length; offset += 1) {
      const photo = imagePool[(ordinal + offset) % imagePool.length];
      if (!usedImages.has(photo.image)) {
        usedImages.add(photo.image);
        return photo.image;
      }
    }
  }

  const keyword = keywordFallbacks.find(([pattern]) => pattern.test(name))?.[1] || category.replace(/[^a-z]/gi, '').toLowerCase();
  const lock = 100000 + Math.max(0, Number(index) || 0);
  const fallbackImage = `https://loremflickr.com/900/900/${keyword}?lock=${lock}&v=4`;
  usedImages.add(fallbackImage);
  return fallbackImage;
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
  const usedImages = new Set();

  const initialProducts = Array.from({ length: 120 }, (_, index) => {
    const category = catalogCategories[index % catalogCategories.length];
    const categoryPosition = Math.floor(index / catalogCategories.length);
    const name = `${productNames[index % productNames.length]} ${productTypes[category][categoryPosition % productTypes[category].length]}`;
    return {
      id: `PROD-${String(index + 1).padStart(3, '0')}`,
      name,
      category,
      price: 35 + ((index * 29) % 310),
      stock: index % 9 === 0 ? 7 : 18 + ((index * 13) % 120),
      salesCount: 20 + ((index * 37) % 430),
      image: getProductImage(category, index, name, usedImages),
      description: createProductDescription({ name, category }),
      reviews: createDemoReviews({ name, id: `PROD-${String(index + 1).padStart(3, '0')}` })
    };
  });

  const statuses = ['Delivered', 'Processing', 'Shipped', 'Cancelled'];
  const customers = ['Jordan Lee', 'Maya Patel', 'Alex Johnson', 'Morgan Brown', 'Sam Davis', 'Taylor Wilson', 'Casey Kim', 'Riley Smith'];
  const currentDate = new Date();
  const initialOrders = Array.from({ length: 160 }, (_, index) => {
    const product = initialProducts[(index * 7) % initialProducts.length];
    const quantity = (index % 3) + 1;
    const monthOffset = index % 12;
    const maxDay = monthOffset === 0 ? currentDate.getDate() : 28;
    const orderDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, Math.min((index % 25) + 1, maxDay));
    const date = toLocalDateString(orderDate);
    return {
      id: `ORD-${1000 + index}`,
      customerName: customers[index % customers.length],
      customerEmail: `sample${index % customers.length}@shopmetrics.test`,
      productName: product.name,
      items: [{ productId: product.id, name: product.name, quantity, unitPrice: product.price }],
      category: product.category,
      quantity,
      totalAmount: product.price * quantity,
      status: statuses[index % statuses.length],
      date
    };
  });

  return { products: initialProducts, orders: initialOrders, returnRequests: [], promotions: [], supportTickets: [] };
};

const getMerchantStorageKey = (type, email) => `sm_${type}_${email}`;
const getMerchantOwnerKey = (email) => `sm_merchant_owner_${email}`;
const toLocalDateString = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getDataOwnerEmail = (account) => account?.role === 'customer' ? account.merchantEmail : account?.email;

const getDefaultMerchantEmail = () => {
  const registeredMerchants = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
  return registeredMerchants[0]?.email || localStorage.getItem('sm_demo_merchant_email') || 'admin@shop.com';
};

const ensureSampleData = (data) => {
  const sampleData = generateInitialMockData();
  // Preserve one copy of each current image. Reassign legacy generated images
  // and any duplicates so every product has its own image URL.
  const imageCounts = data.products.reduce((counts, product) => {
    if (product.image) counts.set(product.image, (counts.get(product.image) || 0) + 1);
    return counts;
  }, new Map());
  const usedImages = new Set();
  const normalizedProducts = data.products.map((product, index) => {
    const isGeneratedImage = product.image?.includes('loremflickr.com') || product.image?.includes('&product=');
    const isDuplicate = product.image && (imageCounts.get(product.image) > 1 || usedImages.has(product.image));
    if (product.image && !isGeneratedImage && !isDuplicate) {
      usedImages.add(product.image);
      return product;
    }
    const productNumber = Number(product.id?.match(/\d+$/)?.[0]);
    const image = getProductImage(product.category, Number.isFinite(productNumber) ? productNumber - 1 : index, product.name, usedImages);
    return { ...product, image };
  });
  const productsWithDescriptions = ensureProductDescriptions(normalizedProducts);
  const productsWithDemoReviews = ensureDemoReviews(productsWithDescriptions);
  const normalizedOrders = data.orders.map(order => {
    let normalizedOrder = order;
    if (!order.items?.length) {
      const matchedProduct = productsWithDemoReviews.find(product => order.productName === product.name || order.productName?.startsWith(`${product.name} x`));
      if (matchedProduct) normalizedOrder = { ...order, items: [{ productId: matchedProduct.id, name: matchedProduct.name, quantity: Number(order.quantity) || 1, unitPrice: matchedProduct.price }] };
    }
    if (order.customerEmail?.endsWith('@shopmetrics.test') && /^ORD-1\d{3}$/.test(order.id)) {
      const now = new Date();
      const monthOffset = (Number(order.id.slice(4)) - 1000) % 12;
      const monthDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const maxDay = monthOffset === 0 ? now.getDate() : 28;
      const date = toLocalDateString(new Date(monthDate.getFullYear(), monthDate.getMonth(), Math.min((Number(order.id.slice(4)) % 25) + 1, maxDay)));
      normalizedOrder = { ...normalizedOrder, date };
    }
    return normalizedOrder;
  });
  if (productsWithDemoReviews.length >= 120 && normalizedOrders.length >= 100) return { ...data, products: productsWithDemoReviews, orders: normalizedOrders, returnRequests: data.returnRequests || [], promotions: data.promotions || [], supportTickets: data.supportTickets || [] };
  const productIds = new Set(productsWithDemoReviews.map(product => product.id));
  const orderIds = new Set(data.orders.map(order => order.id));
  return {
    ...data,
    products: [...productsWithDemoReviews, ...sampleData.products.filter(product => !productIds.has(product.id))],
    orders: [...normalizedOrders, ...sampleData.orders.filter(order => !orderIds.has(order.id))],
    returnRequests: data.returnRequests || [],
    promotions: data.promotions || [],
    supportTickets: data.supportTickets || []
  };
};

const loadMerchantData = (email) => {
  const savedProducts = localStorage.getItem(getMerchantStorageKey('products', email));
  const savedOrders = localStorage.getItem(getMerchantStorageKey('orders', email));
  const savedReturns = localStorage.getItem(getMerchantStorageKey('returns', email));
  const savedPromotions = localStorage.getItem(getMerchantStorageKey('promotions', email));
  const savedSupport = localStorage.getItem(getMerchantStorageKey('support', email));

  if (savedProducts || savedOrders || savedReturns || savedPromotions || savedSupport) {
    return ensureSampleData({
      products: savedProducts ? JSON.parse(savedProducts) : [],
      orders: savedOrders ? JSON.parse(savedOrders) : [],
      returnRequests: savedReturns ? JSON.parse(savedReturns) : [],
      promotions: savedPromotions ? JSON.parse(savedPromotions) : [],
      supportTickets: savedSupport ? JSON.parse(savedSupport) : []
    });
  }

  if (email === 'admin@shop.com') {
    const legacyProducts = localStorage.getItem('sm_products');
    const legacyOrders = localStorage.getItem('sm_orders');
    if (legacyProducts || legacyOrders) {
      return ensureSampleData({
        products: legacyProducts ? JSON.parse(legacyProducts) : [],
        orders: legacyOrders ? JSON.parse(legacyOrders) : [],
        returnRequests: [], promotions: [], supportTickets: []
      });
    }
    return generateInitialMockData();
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
  const [returnRequests, setReturnRequests] = useState(initialMerchantData.returnRequests || []);
  const [promotions, setPromotions] = useState(initialMerchantData.promotions || []);
  const [supportTickets, setSupportTickets] = useState(initialMerchantData.supportTickets || []);
  const [isMerchantDataLoaded, setIsMerchantDataLoaded] = useState(Boolean(user));
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [theme, setTheme] = useState(() => {
    if (localStorage.getItem('sm_theme_v2') !== 'light-default') {
      localStorage.setItem('sm_theme', 'light');
      localStorage.setItem('sm_theme_v2', 'light-default');
      return 'light';
    }
    return localStorage.getItem('sm_theme') || 'light';
  });
  const dataOwnerEmail = getDataOwnerEmail(user);

  useEffect(() => {
    if (user?.role === 'merchant' && user.email && user.name) {
      localStorage.setItem(getMerchantOwnerKey(user.email), user.name);
    }
  }, [user?.email, user?.name, user?.role]);

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
    if (!dataOwnerEmail || !isMerchantDataLoaded) return;
    localStorage.setItem(getMerchantStorageKey('returns', dataOwnerEmail), JSON.stringify(returnRequests));
  }, [returnRequests, dataOwnerEmail, isMerchantDataLoaded]);
  useEffect(() => {
    if (!dataOwnerEmail || !isMerchantDataLoaded) return;
    localStorage.setItem(getMerchantStorageKey('promotions', dataOwnerEmail), JSON.stringify(promotions));
  }, [promotions, dataOwnerEmail, isMerchantDataLoaded]);
  useEffect(() => {
    if (!dataOwnerEmail || !isMerchantDataLoaded) return;
    localStorage.setItem(getMerchantStorageKey('support', dataOwnerEmail), JSON.stringify(supportTickets));
  }, [supportTickets, dataOwnerEmail, isMerchantDataLoaded]);

  useEffect(() => {
    if (!dataOwnerEmail) return undefined;

    const handleSharedDataUpdate = (event) => {
      if (event.key === getMerchantStorageKey('products', dataOwnerEmail) && event.newValue) {
        setProducts(JSON.parse(event.newValue));
      }
      if (event.key === getMerchantStorageKey('orders', dataOwnerEmail) && event.newValue) {
        setOrders(JSON.parse(event.newValue));
      }
      if (event.key === getMerchantStorageKey('returns', dataOwnerEmail) && event.newValue) setReturnRequests(JSON.parse(event.newValue));
      if (event.key === getMerchantStorageKey('promotions', dataOwnerEmail) && event.newValue) setPromotions(JSON.parse(event.newValue));
      if (event.key === getMerchantStorageKey('support', dataOwnerEmail) && event.newValue) setSupportTickets(JSON.parse(event.newValue));
    };

    window.addEventListener('storage', handleSharedDataUpdate);
    return () => window.removeEventListener('storage', handleSharedDataUpdate);
  }, [dataOwnerEmail]);


  const financialMetrics = useMemo(() => {
    const activeOrders = orders.filter(order => order.status !== 'Cancelled');
    const refundedAmount = returnRequests.filter(request => request.status === 'Refunded').reduce((sum, request) => sum + request.refundAmount, 0);
    const totalRevenue = Math.max(0, activeOrders.reduce((sum, order) => sum + order.totalAmount, 0) - refundedAmount);
    const totalOrdersCount = activeOrders.length;
    const averageOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(2) : '0.00';
    const lowStockCount = products.filter(p => !p.isArchived && (p.stock <= 0 || p.stock < (p.lowStockThreshold ?? 15))).length;

    const now = new Date();
    const reportingPeriods = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const name = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      return { key, name, Revenue: 0 };
    });
    const periodIndex = new Map(reportingPeriods.map((period, index) => [period.key, index]));
    orders.forEach(order => {
      if (order.status === 'Cancelled' || !order.date) return;
      const date = new Date(`${order.date}T00:00:00`);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const index = periodIndex.get(key);
      if (index !== undefined) reportingPeriods[index].Revenue += Number(order.totalAmount) || 0;
    });
    const chartData = reportingPeriods.map(({ name, Revenue }) => ({ name, Revenue }));

    return {
      totalRevenue,
      averageOrderValue,
      totalOrdersCount,
      lowStockCount,
      chartData
    };
  }, [orders, products, returnRequests]);

  // Authentication Handlers
  const activateUser = (account) => {
    let savedProfile = null;
    try { savedProfile = JSON.parse(localStorage.getItem(`sm_profile_${account.email}`) || '{}'); } catch { /* Ignore malformed saved profile data. */ }
    const activeAccount = { ...account, profile: { ...(account.profile || {}), ...(savedProfile || {}) } };
    if (activeAccount.role === 'merchant') {
      localStorage.setItem(getMerchantOwnerKey(activeAccount.email), activeAccount.name);
    }
    const merchantData = loadMerchantData(getDataOwnerEmail(activeAccount));
    setProducts(merchantData.products);
    setOrders(merchantData.orders);
    setReturnRequests(merchantData.returnRequests || []);
    setPromotions(merchantData.promotions || []);
    setSupportTickets(merchantData.supportTickets || []);
    setIsMerchantDataLoaded(true);
    setUser(activeAccount);
    localStorage.setItem('sm_current_user', JSON.stringify(activeAccount));
  };

  const handleLogin = (email, password, accountType = 'merchant') => {
    const normalizedEmail = email.trim().toLowerCase();
    if (accountType === 'customer') {
      const savedCustomers = JSON.parse(localStorage.getItem('sm_registered_customers') || '[]');
      const matchedCustomer = savedCustomers.find(customer => customer.email?.trim().toLowerCase() === normalizedEmail && customer.password === password);
      if (!matchedCustomer) return { success: false, error: 'Invalid customer credentials.' };
      activateUser({ ...matchedCustomer, role: 'customer' });
      return { success: true };
    }

    const savedUsers = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
    const matchedUser = savedUsers.find(u => u.email?.trim().toLowerCase() === normalizedEmail && u.password === password);

    if (matchedUser) {
      const activeSession = { name: matchedUser.name, email: matchedUser.email, role: 'merchant' };
      activateUser(activeSession);
      return { success: true };
    }
    const demoEmail = localStorage.getItem('sm_demo_merchant_email') || 'admin@shop.com';
    if (normalizedEmail === demoEmail.trim().toLowerCase() && password === 'admin123') {
      const savedName = localStorage.getItem('sm_demo_merchant_name')
        || localStorage.getItem(getMerchantOwnerKey(demoEmail));
      const demoUser = { name: savedName || 'Demo Owner', email: demoEmail, role: 'merchant' };
      activateUser(demoUser);
      return { success: true };
    }
    return { success: false, error: 'Invalid authentication credentials.' };
  };

  const handleRegister = (name, email, password, accountType = 'merchant') => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    if (accountType === 'customer') {
      const savedCustomers = JSON.parse(localStorage.getItem('sm_registered_customers') || '[]');
      if (savedCustomers.some(customer => customer.email?.trim().toLowerCase() === normalizedEmail)) {
        return { success: false, error: 'Customer email is already registered.' };
      }
      const newCustomer = { name: normalizedName, email: normalizedEmail, password, merchantEmail: getDefaultMerchantEmail(), role: 'customer' };
      localStorage.setItem('sm_registered_customers', JSON.stringify([...savedCustomers, newCustomer]));
      activateUser(newCustomer);
      return { success: true };
    }

    const savedUsers = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
    if (savedUsers.length > 0) {
      return { success: false, error: 'Only one merchant account is available for this store.' };
    }
    if (savedUsers.some(u => u.email?.trim().toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'Email descriptor already registered.' };
    }
    const updatedUsers = [...savedUsers, { name: normalizedName, email: normalizedEmail, password, createdAt: new Date().toISOString() }];
    localStorage.setItem('sm_registered_users', JSON.stringify(updatedUsers));

    const newUser = { name: normalizedName, email: normalizedEmail, role: 'merchant' };
    activateUser(newUser);
    return { success: true };
  };

  const handleLogout = () => {
    setUser(null);
    setProducts([]);
    setOrders([]);
    setReturnRequests([]);
    setPromotions([]);
    setSupportTickets([]);
    setIsMerchantDataLoaded(false);
    localStorage.removeItem('sm_current_user');
    setActiveTab('Dashboard');
  };

  // Inventory CRUD Array Mutators
  const addProduct = (newProduct) => {
    setProducts(prev => {
      const nextNumber = prev.reduce((max, product) => Math.max(max, Number(product.id?.match(/\d+$/)?.[0]) || 0), 0) + 1;
      const usedImages = new Set(prev.map(product => product.image).filter(Boolean));
      const id = `PROD-${String(nextNumber).padStart(3, '0')}`;
      const product = {
        ...newProduct, 
        id,
        image: newProduct.image || getProductImage(newProduct.category, nextNumber - 1, newProduct.name, usedImages),
        description: newProduct.description?.trim() || createProductDescription(newProduct),
        descriptionDeleted: false,
        price: Number(newProduct.price), 
        stock: Number(newProduct.stock),
        salesCount: 0,
        lowStockThreshold: newProduct.lowStockThreshold == null || newProduct.lowStockThreshold === '' || !Number.isFinite(Number(newProduct.lowStockThreshold)) ? 15 : Math.max(0, Number(newProduct.lowStockThreshold)),
        isArchived: false
      };
      product.reviews = ensureDemoReviews([{ ...product, reviews: newProduct.reviews || [] }])[0].reviews;
      return [product, ...prev];
    });
  };

  const archiveProduct = (productId, isArchived = true) => {
    setProducts(prev => prev.map(product => product.id === productId ? { ...product, isArchived } : product));
  };

  const updateProduct = (updatedProduct) => {
    setProducts(prev => prev.map(prod => 
      {
        if (prod.id !== updatedProduct.id) return prod;
        const descriptionDeleted = updatedProduct.descriptionDeleted ?? prod.descriptionDeleted ?? false;
        return {
          ...updatedProduct,
          description: descriptionDeleted ? '' : updatedProduct.description?.trim() || prod.description || createProductDescription(updatedProduct),
          descriptionDeleted,
          reviews: updatedProduct.reviews || prod.reviews || createDemoReviews(updatedProduct),
          price: Number(updatedProduct.price),
          stock: Number(updatedProduct.stock)
        };
      }
    ));
  };

  const addProductReview = (productId, review) => {
    setProducts(previousProducts => previousProducts.map(product => product.id === productId
      ? { ...product, reviews: [...(product.reviews || []), { ...review, id: review.id || `review-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }] }
      : product
    ));
  };

  const deleteProductReview = (productId, reviewId, reviewIndex) => {
    setProducts(previousProducts => previousProducts.map(product => {
      if (product.id !== productId) return product;
      const reviews = product.reviews || [];
      const reviewToDelete = reviewId ? reviews.find(review => review.id === reviewId) : reviews[reviewIndex];
      if (!reviewToDelete) return product;
      const deletedDemoReviewIds = reviewToDelete.isDemoReview
        ? [...new Set([...(product.deletedDemoReviewIds || []), reviewToDelete.id])]
        : product.deletedDemoReviewIds || [];
      return {
        ...product,
        reviews: reviews.filter((review, index) => reviewId ? review.id !== reviewId : index !== reviewIndex),
        deletedDemoReviewIds
      };
    }));
  };

  const deleteAccount = () => {
    if (!user) return;
    localStorage.removeItem(`sm_profile_${user.email}`);
    if (user.role === 'merchant') {
      const users = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
      const isRegisteredAccount = users.some(account => account.email === user.email);
      localStorage.setItem('sm_registered_users', JSON.stringify(users.filter(account => account.email !== user.email)));
      ['products', 'orders', 'returns', 'promotions', 'support'].forEach(type => localStorage.removeItem(getMerchantStorageKey(type, user.email)));
      localStorage.removeItem(getMerchantOwnerKey(user.email));
      if (!isRegisteredAccount && [ 'admin@shop.com', localStorage.getItem('sm_demo_merchant_email') ].includes(user.email)) {
        localStorage.removeItem('sm_demo_merchant_name');
        localStorage.removeItem('sm_demo_merchant_email');
        localStorage.removeItem('sm_products');
        localStorage.removeItem('sm_orders');
      }
    } else {
      const customers = JSON.parse(localStorage.getItem('sm_registered_customers') || '[]');
      localStorage.setItem('sm_registered_customers', JSON.stringify(customers.filter(account => account.email !== user.email)));
      ['cart', 'wishlist', 'compare', 'addresses', 'delivery'].forEach(type => localStorage.removeItem(`sm_${type}_${user.email}`));
    }
    handleLogout();
  };

  const updateProfile = (name, email, profile = {}) => {
    if (!user) return { success: false, error: 'No active account.' };
    const normalizedEmail = email.trim().toLowerCase();
    const accounts = JSON.parse(localStorage.getItem(user.role === 'merchant' ? 'sm_registered_users' : 'sm_registered_customers') || '[]');
    if (accounts.some(account => account.email?.trim().toLowerCase() === normalizedEmail && account.email?.trim().toLowerCase() !== user.email.trim().toLowerCase())) {
      return { success: false, error: 'That email address is already attached to another account.' };
    }
    const updatedUser = { ...user, name, email, profile };
    setUser(updatedUser);
    localStorage.setItem('sm_current_user', JSON.stringify(updatedUser));
    localStorage.setItem(`sm_profile_${email}`, JSON.stringify(profile));
    if (email !== user.email) localStorage.removeItem(`sm_profile_${user.email}`);
    if (user.role === 'merchant') {
      if (email !== user.email) {
        ['products', 'orders', 'returns', 'promotions', 'support'].forEach(type => {
          const oldKey = getMerchantStorageKey(type, user.email);
          const newKey = getMerchantStorageKey(type, email);
          const savedValue = localStorage.getItem(oldKey);
          if (savedValue && !localStorage.getItem(newKey)) localStorage.setItem(newKey, savedValue);
          localStorage.removeItem(oldKey);
        });
        localStorage.removeItem(getMerchantOwnerKey(user.email));
      }
      localStorage.setItem(getMerchantOwnerKey(email), name);
      const users = JSON.parse(localStorage.getItem('sm_registered_users') || '[]');
      const isDemoAccount = !users.some(account => account.email === user.email)
        && [ 'admin@shop.com', localStorage.getItem('sm_demo_merchant_email') ].includes(user.email);
      if (isDemoAccount) {
        localStorage.setItem('sm_demo_merchant_name', name);
        localStorage.setItem('sm_demo_merchant_email', email);
      }
      if (email !== user.email) {
        const customers = JSON.parse(localStorage.getItem('sm_registered_customers') || '[]');
        localStorage.setItem('sm_registered_customers', JSON.stringify(customers.map(account => account.merchantEmail === user.email ? { ...account, merchantEmail: email } : account)));
      }
      localStorage.setItem('sm_registered_users', JSON.stringify(users.map(account => account.email === user.email ? { ...account, name, email, profile } : account)));
    } else {
      setOrders(previous => previous.map(order => order.customerEmail === user.email ? { ...order, customerName: name, customerEmail: email } : order));
      setReturnRequests(previous => previous.map(request => request.customerEmail === user.email ? { ...request, customerName: name, customerEmail: email } : request));
      setSupportTickets(previous => previous.map(ticket => ticket.customerEmail === user.email ? { ...ticket, customerName: name, customerEmail: email } : ticket));
      if (email !== user.email) {
        ['cart', 'wishlist', 'compare', 'addresses', 'delivery'].forEach(type => {
          const oldKey = `sm_${type}_${user.email}`;
          const newKey = `sm_${type}_${email}`;
          const savedValue = localStorage.getItem(oldKey);
          if (savedValue && !localStorage.getItem(newKey)) localStorage.setItem(newKey, savedValue);
          localStorage.removeItem(oldKey);
        });
      }
      const customers = JSON.parse(localStorage.getItem('sm_registered_customers') || '[]');
      localStorage.setItem('sm_registered_customers', JSON.stringify(customers.map(account => account.email === user.email ? { ...account, name, email, profile } : account)));
    }
    return { success: true };
  };

  const updateOrder = (orderId, changes) => {
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, ...changes, updatedAt: new Date().toISOString() } : order));
  };

  const getCouponQuote = (code, subtotal) => {
    if (!code?.trim()) return { success: true, discountAmount: 0, promotion: null };
    const normalizedCode = code.trim().toUpperCase();
    const promotion = promotions.find(item => item.code.toUpperCase() === normalizedCode);
    if (!promotion || !promotion.active) return { success: false, error: 'That promo code is not active.' };
    if (promotion.expiresAt && new Date(`${promotion.expiresAt}T23:59:59`) < new Date()) return { success: false, error: 'That promo code has expired.' };
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) return { success: false, error: 'That promo code has reached its redemption limit.' };
    if (Number(subtotal) < Number(promotion.minimumOrder || 0)) return { success: false, error: `Spend $${Number(promotion.minimumOrder).toFixed(2)} to use this code.` };
    const rawDiscount = promotion.discountType === 'percent' ? Number(subtotal) * Number(promotion.discountValue) / 100 : Number(promotion.discountValue);
    const discountAmount = Math.min(Number(subtotal), Math.max(0, Math.round(rawDiscount * 100) / 100));
    return { success: true, promotion, discountAmount };
  };

  const addPromotion = (promotion) => {
    const normalized = { ...promotion, id: `PROMO-${Date.now()}`, code: promotion.code.trim().toUpperCase(), usedCount: 0, active: true };
    setPromotions(previous => [normalized, ...previous]);
    return normalized;
  };

  const updatePromotion = (promotionId, changes) => setPromotions(previous => previous.map(promotion => promotion.id === promotionId ? { ...promotion, ...changes, code: (changes.code ?? promotion.code).trim().toUpperCase() } : promotion));
  const deletePromotion = (promotionId) => setPromotions(previous => previous.filter(promotion => promotion.id !== promotionId));

  const createReturnRequest = ({ orderId, productId, quantity, reason, details = '' }) => {
    if (!user || user.role !== 'customer') return { success: false, error: 'Customer session required.' };
    const order = orders.find(item => item.id === orderId && item.customerEmail === user.email);
    if (!order || order.status !== 'Delivered') return { success: false, error: 'Only delivered orders can be returned.' };
    const lineItem = order.items?.find(item => item.productId === productId);
    if (!lineItem) return { success: false, error: 'This order item cannot be returned from the demo order record.' };
    const alreadyRequested = returnRequests.filter(request => request.orderId === orderId && request.productId === productId && request.status !== 'Declined').reduce((sum, request) => sum + request.quantity, 0);
    const remaining = lineItem.quantity - alreadyRequested;
    const returnQuantity = Number(quantity);
    if (!Number.isInteger(returnQuantity) || returnQuantity < 1 || returnQuantity > remaining) return { success: false, error: `You can return up to ${Math.max(0, remaining)} more.` };
    const request = {
      id: `RET-${Date.now()}`, orderId, productId, productName: lineItem.name, quantity: returnQuantity,
      unitPrice: lineItem.unitPrice, refundAmount: Math.round(lineItem.unitPrice * returnQuantity * 100) / 100,
      reason, details: details.trim(), customerName: user.name, customerEmail: user.email,
      status: 'Requested', createdAt: new Date().toISOString()
    };
    setReturnRequests(previous => [request, ...previous]);
    return { success: true, request };
  };

  const updateReturnStatus = (requestId, nextStatus) => {
    const request = returnRequests.find(item => item.id === requestId);
    if (!request) return { success: false, error: 'Return request was not found.' };
    const allowed = { Requested: ['Approved', 'Declined'], Approved: ['Received', 'Declined'], Received: ['Refunded'], Declined: [], Refunded: [] };
    if (!allowed[request.status]?.includes(nextStatus)) return { success: false, error: `A return cannot move from ${request.status} to ${nextStatus}.` };
    const now = new Date().toISOString();
    setReturnRequests(previous => previous.map(item => item.id === requestId ? { ...item, status: nextStatus, updatedAt: now } : item));
    if (nextStatus === 'Received' && !request.inventoryRestocked) {
      setProducts(previous => previous.map(product => product.id === request.productId ? { ...product, stock: product.stock + request.quantity, salesCount: Math.max(0, product.salesCount - request.quantity) } : product));
      setReturnRequests(previous => previous.map(item => item.id === requestId ? { ...item, inventoryRestocked: true, receivedAt: now } : item));
    }
    if (nextStatus === 'Refunded') {
      setReturnRequests(previous => previous.map(item => item.id === requestId ? { ...item, refundedAt: now } : item));
    }
    return { success: true };
  };

  const createSupportTicket = ({ subject, message, orderId = '' }) => {
    if (!user || user.role !== 'customer') return { success: false, error: 'Customer session required.' };
    const ticket = { id: `HELP-${Date.now()}`, customerName: user.name, customerEmail: user.email, orderId, subject: subject.trim(), status: 'Open', createdAt: new Date().toISOString(), messages: [{ author: user.name, role: 'customer', message: message.trim(), createdAt: new Date().toISOString() }] };
    setSupportTickets(previous => [ticket, ...previous]);
    return { success: true, ticket };
  };

  const replyToSupportTicket = (ticketId, message) => setSupportTickets(previous => previous.map(ticket => ticket.id === ticketId ? { ...ticket, status: ticket.status === 'Resolved' ? 'Open' : ticket.status, updatedAt: new Date().toISOString(), messages: [...ticket.messages, { author: user.name, role: user.role, message: message.trim(), createdAt: new Date().toISOString() }] } : ticket));
  const updateSupportTicketStatus = (ticketId, status) => setSupportTickets(previous => previous.map(ticket => ticket.id === ticketId ? { ...ticket, status, updatedAt: new Date().toISOString() } : ticket));

  const updateOrderStatus = (orderId, newStatus) => {
    const order = orders.find(candidate => candidate.id === orderId);
    if (!order) return { success: false, error: 'Order was not found.' };
    const allowedTransitions = { Processing: ['Shipped', 'Cancelled'], Shipped: ['Delivered'], Delivered: [], Cancelled: [] };
    if (!allowedTransitions[order.status]?.includes(newStatus)) return { success: false, error: `An order cannot move from ${order.status} to ${newStatus}.` };
    const now = new Date().toISOString();
    setOrders(prev => prev.map(candidate => candidate.id === orderId ? { ...candidate, status: newStatus, updatedAt: now, ...(newStatus === 'Shipped' ? { shippedAt: now } : {}), ...(newStatus === 'Delivered' ? { deliveredAt: now } : {}) } : candidate));
    if (newStatus === 'Cancelled' && !order.inventoryRestored && order.items?.length) {
      setProducts(previousProducts => previousProducts.map(product => {
        const orderedLine = order.items.find(item => item.productId === product.id);
        return orderedLine ? { ...product, stock: product.stock + orderedLine.quantity, salesCount: Math.max(0, product.salesCount - orderedLine.quantity) } : product;
      }));
      setOrders(previous => previous.map(candidate => candidate.id === orderId ? { ...candidate, inventoryRestored: true } : candidate));
    }
    return { success: true };
  };

  const placeOrder = (cartItems, shippingAddress, couponCode = '') => {
    if (!user || user.role !== 'customer') return { success: false, error: 'Customer session required.' };
    const requiredAddressFields = ['recipientName', 'phone', 'streetAddress', 'city', 'region', 'postalCode'];
    if (!shippingAddress || requiredAddressFields.some(field => !shippingAddress[field]?.trim())) {
      return { success: false, error: 'Complete all delivery details before placing the order.' };
    }

    const consolidatedItems = [...cartItems.reduce((itemsById, item) => {
      const current = itemsById.get(item.id);
      itemsById.set(item.id, { ...item, quantity: Number(item.quantity) + (current?.quantity || 0) });
      return itemsById;
    }, new Map()).values()];
    const unavailableItem = consolidatedItems.find(item => {
      const product = products.find(currentProduct => currentProduct.id === item.id);
      return !product || product.isArchived || product.stock < item.quantity;
    });
    if (unavailableItem) return { success: false, error: `${unavailableItem.name} is no longer available in that quantity.` };

    const checkoutItems = consolidatedItems.map(item => {
      const currentProduct = products.find(product => product.id === item.id);
      return { ...item, name: currentProduct.name, category: currentProduct.category, price: Number(currentProduct.price) };
    });

    const updatedProducts = products.map(product => {
      const cartItem = checkoutItems.find(item => item.id === product.id);
      if (!cartItem) return product;
      return {
        ...product,
        stock: product.stock - cartItem.quantity,
        salesCount: product.salesCount + cartItem.quantity
      };
    });
    const subtotal = checkoutItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const coupon = getCouponQuote(couponCode, subtotal);
    if (!coupon.success) return coupon;
    const orderTotal = Math.max(0, subtotal - coupon.discountAmount);
    const order = {
      id: `ORD-${Date.now()}`,
      customerName: user.name,
      customerEmail: user.email,
      productName: checkoutItems.map(item => `${item.name} x${item.quantity}`).join(', '),
      items: checkoutItems.map(item => ({ productId: item.id, name: item.name, quantity: item.quantity, unitPrice: item.price })),
      category: checkoutItems.length === 1 ? checkoutItems[0].category : 'Multiple categories',
      quantity: checkoutItems.reduce((total, item) => total + item.quantity, 0),
      totalAmount: orderTotal,
      subtotal,
      discountAmount: coupon.discountAmount,
      couponCode: coupon.promotion?.code || '',
      shippingAddress: { ...shippingAddress },
      status: 'Processing',
      date: toLocalDateString(new Date())
    };

    setProducts(updatedProducts);
    setOrders(previousOrders => [order, ...previousOrders]);
    if (coupon.promotion) setPromotions(previous => previous.map(promotion => promotion.id === coupon.promotion.id ? { ...promotion, usedCount: promotion.usedCount + 1 } : promotion));
    return { success: true };
  };

  return (
    <StoreContext.Provider value={{
      products,
      orders,
      returnRequests,
      promotions,
      supportTickets,
      activeTab,
      setActiveTab,
      theme,
      toggleTheme,
      financialMetrics,
      addProduct,
      updateProduct,
      archiveProduct,
      addProductReview,
      deleteProductReview,
      updateOrderStatus,
      updateOrder,
      placeOrder,
      addPromotion,
      updatePromotion,
      deletePromotion,
      getCouponQuote,
      createReturnRequest,
      updateReturnStatus,
      createSupportTicket,
      replyToSupportTicket,
      updateSupportTicketStatus,
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
