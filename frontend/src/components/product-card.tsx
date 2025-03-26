"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { formatPrice } from '@/lib/utils';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    sellerId: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      // В реальном приложении здесь будет вызов API для добавления в корзину
      console.log(`Добавление товара ${product.id} в корзину`);
      // Визуальная обратная связь для пользователя
      await new Promise(resolve => setTimeout(resolve, 500)); // Имитация задержки
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-muted-foreground">Нет изображения</span>
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="line-clamp-1 text-lg">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="line-clamp-2 mb-2 text-sm text-muted-foreground">
          {product.description}
        </p>
        <p className="text-lg font-bold">{formatPrice(product.price)}</p>
      </CardContent>
      <CardFooter className="p-4">
        <Button 
          onClick={handleAddToCart} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
              Добавление...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCartIcon className="h-4 w-4" />
              В корзину
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
