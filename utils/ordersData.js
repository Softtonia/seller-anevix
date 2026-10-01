const defaultOrders = [
  {
    id: '123456789',
    productName: 'Chappati boxes for kitchen in grey',
    image: '/assets/images/product1.png',
    size: 'Free Size',
    qty: 1,
    paymentMethod: 'Cash on Delivery',
    timeInfo: 'Ordered 3 days ago • Delivery within next 2 days',
    status: 'preparing', // confirmed, preparing, picked-up, delivered, cancelled
    subtotal: 1499,
    tax: 270,
    total: 1769,
    address: '123, Park Avenue, Sector 4, Mumbai, Maharashtra - 400001',
    deliveryDate: 'Sep 21, 2024',
    deliveryMessage: 'Yay! Your order was delivered 2 days earlier.',
    statusSteps: [
      { key: 'confirmed', label: 'Confirmed', state: 'completed' },
      { key: 'preparing', label: 'Preparing', state: 'current' },
      { key: 'picked-up', label: 'Picked-up', state: 'upcoming' },
      { key: 'delivered', label: 'Delivered', state: 'upcoming' },
    ],
    updates: [
      {
        title: 'Order Placed',
        message: 'Your order has been received',
        date: '2024-01-15',
        time: '10:30 AM',
        completed: true,
      },
      {
        title: 'Order Confirmed',
        message: 'We have confirmed your order',
        date: '2024-01-15',
        time: '11:45 AM',
        completed: true,
      },
      {
        title: 'Order Processed',
        message: 'Your items are being prepared for shipment',
        date: '2024-01-16',
        time: '09:15 AM',
        completed: false,
      },
      {
        title: 'Shipped',
        message: 'Your order is on the way',
        date: '2024-01-17',
        time: '07:36 AM',
        completed: false,
      },
      {
        title: 'Delivered',
        message: 'Expected Delivery',
        date: '2024-01-20',
        time: '02:36 PM',
        completed: false,
      },
    ],
  },
  {
    id: '987654321',
    productName: 'Premium Cotton Double Bedsheet in Brown',
    image: '/assets/images/product2.png',
    size: 'Free Size',
    qty: 1,
    paymentMethod: 'Cash on Delivery',
    timeInfo: 'Ordered 7 days ago • Delivered Successfully',
    status: 'delivered',
    subtotal: 2499,
    tax: 450,
    total: 2949,
    address: '456, Marine Drive, Near Sea Face, Mumbai, Maharashtra - 400020',
    deliveryDate: 'Sep 21, 2024',
    deliveryMessage: 'Yay! Your order was delivered 2 days earlier.',
    statusSteps: [
      { key: 'confirmed', label: 'Confirmed', state: 'completed' },
      { key: 'preparing', label: 'Preparing', state: 'completed' },
      { key: 'picked-up', label: 'Picked-up', state: 'completed' },
      { key: 'delivered', label: 'Delivered', state: 'completed' },
    ],
    updates: [
      {
        title: 'Order Placed',
        message: 'Your order has been received',
        date: '2024-01-15',
        time: '10:30 AM',
        completed: true,
      },
      {
        title: 'Order Confirmed',
        message: 'We have confirmed your order',
        date: '2024-01-15',
        time: '11:45 AM',
        completed: true,
      },
      {
        title: 'Order Processed',
        message: 'Your items are being prepared for shipment',
        date: '2024-01-16',
        time: '09:15 AM',
        completed: true,
      },
      {
        title: 'Shipped',
        message: 'Your order is on the way',
        date: '2024-01-17',
        time: '07:36 AM',
        completed: true,
      },
      {
        title: 'Delivered',
        message: 'Your order has been delivered successfully',
        date: '2024-01-20',
        time: '02:36 PM',
        completed: true,
      },
    ],
  },
];

// Load mock data from localStorage if available (client-side only)
export const getOrders = () => {
  if (typeof window === 'undefined') return defaultOrders;
  const saved = localStorage.getItem('anevix_orders');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return defaultOrders;
    }
  }
  localStorage.setItem('anevix_orders', JSON.stringify(defaultOrders));
  return defaultOrders;
};

// Find a single order by ID
export const getOrderById = (id) => {
  const orders = getOrders();
  return orders.find((order) => order.id === id);
};

// Update order status to Cancelled
export const cancelOrderById = (id, reason = '', comments = '') => {
  if (typeof window === 'undefined') return;
  const orders = getOrders();
  const updated = orders.map((order) => {
    if (order.id === id) {
      return {
        ...order,
        status: 'cancelled',
        timeInfo: 'Order Cancelled Successfully',
        cancellationReason: reason,
        cancellationComments: comments,
        statusSteps: order.statusSteps.map((step) => ({
          ...step,
          state: 'upcoming', // reset timeline indicator
        })),
      };
    }
    return order;
  });
  localStorage.setItem('anevix_orders', JSON.stringify(updated));
  return updated.find((order) => order.id === id);
};

// Export original array for backward compatibility
export const mockOrders = defaultOrders;
