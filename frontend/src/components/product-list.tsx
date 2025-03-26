"use client";

import React, { useEffect, useState } from 'react';
import ProductCard from './product-card';
import { Product, productsAPI } from '@/lib/api';
import { useAnalytics } from '@/providers/analytics-provider';

interface ProductListProps {
  initialProducts?: Product[];
  category?: string;
}

const ProductList: React.FC<ProductListProps> = ({ initialProducts, category }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts);
  const [error, setError] = useState<string | null>(null);
  const { captureEvent } = useAnalytics();

  useEffect(() => {
    // Если начальные продукты не предоставлены, загружаем их из API
    if (!initialProducts) {
      fetchProducts();
    }
  }, [category, initialProducts]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedProducts = await productsAPI.getAll(category);
      setProducts(fetchedProducts);
      
      // Отправляем событие в PostHog
      captureEvent('products_loaded', {
        count: fetchedProducts.length,
        category: category || 'all',
      });
    } catch (err) {
      console.error('Ошибка при загрузке товаров:', err);
      setError('Не удалось загрузить товары. Пожалуйста, попробуйте позже.');
      
      // Отправляем событие ошибки в PostHog
      captureEvent('products_load_error', {
        error_message: err instanceof Error ? err.message : 'Unknown error',
        category: category || 'all',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-gray-100 animate-pulse rounded-lg h-80"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">Товары не найдены</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
