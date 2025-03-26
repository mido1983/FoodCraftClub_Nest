"use client";

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/providers/analytics-provider";
import { useUser } from "@clerk/nextjs";
import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { captureEvent } = useAnalytics();
  const { isSignedIn, user } = useUser();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      // В реальном приложении здесь будет вызов API для добавления в корзину
      // Отправляем событие добавления товара в корзину в PostHog
      captureEvent('product_added_to_cart', {
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        user_id: isSignedIn ? user.id : 'anonymous',
      });
      // Имитация задержки
      await new Promise(resolve => setTimeout(resolve, 500));
      // Успешное добавление
      console.log(`Товар ${product.name} добавлен в корзину`);
      
      // Вызываем внешний обработчик, если он есть
      if (onAddToCart) {
        onAddToCart(product.id);
      }
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      // Отправляем событие об ошибке добавления товара в корзину в PostHog
      captureEvent('product_add_to_cart_error', {
        product_id: product.id,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductView = () => {
    // Отправляем событие просмотра товара в PostHog
    captureEvent('product_viewed', {
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      user_id: isSignedIn ? user.id : 'anonymous',
    });
  };

  // Отправляем событие просмотра товара при монтировании компонента
  React.useEffect(() => {
    handleProductView();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-1">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="aspect-square w-full relative mb-4 bg-gray-100 rounded-md overflow-hidden">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="object-cover w-full h-full"
              onLoad={() => {
                // Отправляем событие загрузки изображения товара в PostHog
                captureEvent('product_image_loaded', { product_id: product.id });
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Нет изображения
            </div>
          )}
        </div>
        <p className="text-gray-500 line-clamp-2 text-sm mb-2">{product.description}</p>
        <p className="font-bold text-lg">{product.price.toLocaleString('ru-RU')} ₽</p>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleAddToCart} 
          disabled={isLoading}
        >
          {isLoading ? 'Добавление...' : 'В корзину'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
