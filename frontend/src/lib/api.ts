/**
 * API-клиент для взаимодействия с бэкендом
 */

// Базовый URL API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Базовая функция для выполнения запросов к API
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Произошла ошибка при запросе к API');
  }
  
  return await response.json();
}

/**
 * Интерфейсы для типизации данных
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

/**
 * API для работы с товарами
 */
export const productsAPI = {
  // Получение всех товаров
  getAll: async (category?: string): Promise<Product[]> => {
    const endpoint = category 
      ? `/products?category=${encodeURIComponent(category)}` 
      : '/products';
    return fetchAPI<Product[]>(endpoint);
  },
  
  // Получение товара по ID
  getById: async (id: string): Promise<Product> => {
    return fetchAPI<Product>(`/products/${id}`);
  },
  
  // Получение категорий товаров
  getCategories: async (): Promise<Category[]> => {
    return fetchAPI<Category[]>('/products/categories');
  },
};

/**
 * API для работы с корзиной
 */
export const cartAPI = {
  // Добавление товара в корзину
  addItem: async (productId: string, quantity: number = 1): Promise<void> => {
    return fetchAPI<void>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },
  
  // Получение содержимого корзины
  getItems: async (): Promise<OrderItem[]> => {
    return fetchAPI<OrderItem[]>('/cart/items');
  },
  
  // Удаление товара из корзины
  removeItem: async (productId: string): Promise<void> => {
    return fetchAPI<void>(`/cart/items/${productId}`, {
      method: 'DELETE',
    });
  },
  
  // Обновление количества товара в корзине
  updateItemQuantity: async (productId: string, quantity: number): Promise<void> => {
    return fetchAPI<void>(`/cart/items/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  },
};

/**
 * API для работы с заказами
 */
export const ordersAPI = {
  // Создание заказа из корзины
  create: async (): Promise<Order> => {
    return fetchAPI<Order>('/orders', {
      method: 'POST',
    });
  },
  
  // Получение всех заказов пользователя
  getAll: async (): Promise<Order[]> => {
    return fetchAPI<Order[]>('/orders');
  },
  
  // Получение заказа по ID
  getById: async (id: string): Promise<Order> => {
    return fetchAPI<Order>(`/orders/${id}`);
  },
};
