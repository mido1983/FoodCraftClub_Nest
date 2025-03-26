import React from 'react';
import Link from 'next/link';
import ProductList from '@/components/product-list';
import { Product } from '@/lib/api';

// Временные данные для демонстрации
// В реальном приложении эти данные будут получены из Directus через API
const mockProducts: Product[] = Array(12).fill(null).map((_, index) => ({
  id: `${index + 1}`,
  name: index % 4 === 0 ? 'Домашний хлеб на закваске' : 
        index % 4 === 1 ? 'Варенье из клубники' : 
        index % 4 === 2 ? 'Домашние пельмени' : 'Фермерский сыр',
  description: index % 4 === 0 ? 'Ароматный домашний хлеб на натуральной закваске без дрожжей. Хрустящая корочка и мягкий мякиш.' : 
              index % 4 === 1 ? 'Натуральное варенье из отборной клубники. Без консервантов и добавок.' : 
              index % 4 === 2 ? 'Пельмени ручной лепки с фермерским мясом. Готовятся по семейному рецепту.' : 
              'Натуральный сыр из фермерского молока. Выдержка 3 месяца.',
  price: 250 + (index * 50),
  imageUrl: index % 4 === 0 ? 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=500&auto=format&fit=crop' : 
           index % 4 === 1 ? 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=500&auto=format&fit=crop' : 
           index % 4 === 2 ? 'https://images.unsplash.com/photo-1583805989283-15c92588defc?q=80&w=500&auto=format&fit=crop' : 
           'https://images.unsplash.com/photo-1452195100486-9cc805987862?q=80&w=500&auto=format&fit=crop',
  category: index % 4 === 0 ? 'bakery' : 
            index % 4 === 1 ? 'sweets' : 
            index % 4 === 2 ? 'meat' : 'dairy',
  stock: 10 + (index % 10),
  sellerId: `seller${index % 5 + 1}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

// Категории для фильтрации
const categories = [
  { name: 'Все', value: 'all' },
  { name: 'Выпечка', value: 'bakery' },
  { name: 'Молочные продукты', value: 'dairy' },
  { name: 'Мясные изделия', value: 'meat' },
  { name: 'Соленья', value: 'pickles' },
  { name: 'Сладости', value: 'sweets' },
  { name: 'Напитки', value: 'drinks' },
];

// В реальном приложении эта функция будет асинхронной и будет получать данные из API
export default function ProductsPage({ 
  searchParams 
}: { 
  searchParams: { category?: string } 
}) {
  // Получаем категорию из URL-параметров
  const selectedCategory = searchParams.category;
  
  // Фильтруем продукты по категории (в реальном приложении это будет делать API)
  const filteredProducts = selectedCategory && selectedCategory !== 'all'
    ? mockProducts.filter(product => product.category === selectedCategory)
    : mockProducts;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Все товары</h1>
        <p className="text-muted-foreground">
          Выбирайте из широкого ассортимента домашних продуктов от локальных производителей
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[250px_1fr]">
        {/* Сайдбар с фильтрами */}
        <aside className="space-y-6">
          <div>
            <h3 className="mb-4 text-lg font-medium">Категории</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.value}>
                  <Link 
                    href={`/products?category=${category.value}`}
                    className={`text-sm transition-colors hover:text-foreground ${selectedCategory === category.value ? 'font-medium text-foreground' : 'text-muted-foreground'}`}
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium">Цена</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">От</span>
                <input 
                  type="number" 
                  className="w-24 rounded-md border p-2 text-sm" 
                  placeholder="0" 
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">До</span>
                <input 
                  type="number" 
                  className="w-24 rounded-md border p-2 text-sm" 
                  placeholder="10000" 
                />
              </div>
              <button className="mt-2 w-full rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90">
                Применить
              </button>
            </div>
          </div>
        </aside>

        {/* Список товаров */}
        <div>
          <ProductList initialProducts={filteredProducts} />
        </div>
      </div>
    </div>
  );
}
