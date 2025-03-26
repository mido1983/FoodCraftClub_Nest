"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  sellerId: string;
  sellerName: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Имитация загрузки данных корзины
  useEffect(() => {
    // В реальном приложении здесь был бы запрос к API
    setTimeout(() => {
      setCartItems([
        {
          id: '1',
          name: 'Домашний хлеб на закваске',
          price: 250,
          imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=500&auto=format&fit=crop',
          quantity: 1,
          sellerId: 'seller1',
          sellerName: 'Анна Петрова',
        },
        {
          id: '2',
          name: 'Варенье из клубники',
          price: 350,
          imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=500&auto=format&fit=crop',
          quantity: 2,
          sellerId: 'seller2',
          sellerName: 'Иван Сидоров',
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const delivery = 200; // Фиксированная стоимость доставки
    return subtotal + delivery;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
          <p className="text-lg">Загрузка корзины...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Ваша корзина пуста</h1>
          <p className="mb-6 text-muted-foreground">
            Добавьте товары в корзину, чтобы оформить заказ
          </p>
          <Button asChild>
            <Link href="/products">Перейти к товарам</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Корзина</h1>

      <div className="grid gap-8 md:grid-cols-[1fr_350px]">
        {/* Список товаров */}
        <div className="space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-grow flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Продавец: {item.sellerName}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Сводка заказа */}
        <div className="h-fit">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">Сводка заказа</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Подытог</span>
                  <span>{formatPrice(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Доставка</span>
                  <span>{formatPrice(200)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-medium">
                    <span>Итого</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 p-6 pt-0">
              <Button className="w-full" size="lg">
                Оформить заказ
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/products">Продолжить покупки</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
