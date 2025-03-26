import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";

// Временные данные для демонстрации
const mockProducts = [
  {
    id: "1",
    name: "Домашний хлеб на закваске",
    description: "Ароматный домашний хлеб на натуральной закваске без дрожжей. Хрустящая корочка и мягкий мякиш.",
    price: 250,
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=500&auto=format&fit=crop",
    sellerId: "seller1",
  },
  {
    id: "2",
    name: "Варенье из клубники",
    description: "Натуральное варенье из отборной клубники. Без консервантов и добавок.",
    price: 350,
    imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=500&auto=format&fit=crop",
    sellerId: "seller2",
  },
  {
    id: "3",
    name: "Домашние пельмени",
    description: "Пельмени ручной лепки с фермерским мясом. Готовятся по семейному рецепту.",
    price: 450,
    imageUrl: "https://images.unsplash.com/photo-1583805989283-15c92588defc?q=80&w=500&auto=format&fit=crop",
    sellerId: "seller3",
  },
  {
    id: "4",
    name: "Фермерский сыр",
    description: "Натуральный сыр из фермерского молока. Выдержка 3 месяца.",
    price: 550,
    imageUrl: "https://images.unsplash.com/photo-1452195100486-9cc805987862?q=80&w=500&auto=format&fit=crop",
    sellerId: "seller4",
  },
];

export default function Home() {
  const handleAddToCart = (productId: string) => {
    console.log(`Добавление товара ${productId} в корзину`);
    // В реальном приложении здесь будет логика добавления в корзину
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Главный баннер */}
      <section className="mb-12 rounded-xl bg-gradient-to-r from-primary/90 to-primary p-8 text-primary-foreground">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
              Вкусные домашние продукты от локальных производителей
            </h1>
            <p className="mb-6 text-lg">
              Покупайте напрямую у проверенных продавцов и наслаждайтесь натуральными продуктами
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/products">Смотреть все товары</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10" asChild>
                <Link href="/sellers">Наши продавцы</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <Image 
              src="https://images.unsplash.com/photo-1506459225024-1428097a7e18?q=80&w=600&auto=format&fit=crop" 
              alt="Домашние продукты" 
              width={500} 
              height={300}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </section>

      {/* Популярные категории */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold">Популярные категории</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[
            { name: "Выпечка", icon: "🍞" },
            { name: "Молочные продукты", icon: "🧀" },
            { name: "Мясные изделия", icon: "🥩" },
            { name: "Соленья", icon: "🥒" },
            { name: "Сладости", icon: "🍯" },
            { name: "Напитки", icon: "🍹" },
          ].map((category, index) => (
            <Link 
              key={index} 
              href={`/products?category=${category.name}`}
              className="flex flex-col items-center justify-center rounded-lg border bg-card p-4 text-center transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span className="mb-2 text-3xl">{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Популярные товары */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Популярные товары</h2>
          <Link 
            href="/products" 
            className="text-sm font-medium text-primary hover:underline"
          >
            Смотреть все
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {mockProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={handleAddToCart} 
            />
          ))}
        </div>
      </section>

      {/* Как это работает */}
      <section className="mb-12 rounded-xl bg-muted p-8">
        <h2 className="mb-6 text-center text-2xl font-bold">Как это работает</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground">1</div>
            <h3 className="mb-2 text-lg font-semibold">Выберите товары</h3>
            <p className="text-muted-foreground">Просматривайте товары от локальных производителей и добавляйте их в корзину</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground">2</div>
            <h3 className="mb-2 text-lg font-semibold">Оформите заказ</h3>
            <p className="text-muted-foreground">Выберите удобный способ доставки и оплаты</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground">3</div>
            <h3 className="mb-2 text-lg font-semibold">Получите свежие продукты</h3>
            <p className="text-muted-foreground">Наслаждайтесь вкусными домашними продуктами от локальных производителей</p>
          </div>
        </div>
      </section>

      {/* Стать продавцом */}
      <section className="rounded-xl bg-secondary p-8">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="mb-4 text-2xl font-bold">Станьте продавцом на FoodCraftClub</h2>
            <p className="mb-6 text-muted-foreground">
              Продавайте свои домашние продукты на нашей платформе. Мы предоставляем простой способ найти покупателей и развивать ваш бизнес.
            </p>
            <Button asChild>
              <Link href="/seller/register">Стать продавцом</Link>
            </Button>
          </div>
          <div className="hidden md:block">
            <Image 
              src="https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=600&auto=format&fit=crop" 
              alt="Станьте продавцом" 
              width={500} 
              height={300}
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
