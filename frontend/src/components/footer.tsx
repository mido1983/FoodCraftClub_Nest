"use client";

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="flex flex-col">
            <Link href="/" className="text-xl font-bold text-primary">
              FoodCraftClub
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Площадка для покупки и продажи домашних продуктов и блюд
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-medium">Покупателям</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground transition-colors hover:text-foreground">
                  Все товары
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
                  Как это работает
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground transition-colors hover:text-foreground">
                  Частые вопросы
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-medium">Продавцам</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/seller/register" className="text-muted-foreground transition-colors hover:text-foreground">
                  Стать продавцом
                </Link>
              </li>
              <li>
                <Link href="/seller/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
                  Тарифы
                </Link>
              </li>
              <li>
                <Link href="/seller/guide" className="text-muted-foreground transition-colors hover:text-foreground">
                  Руководство
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-medium">Компания</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                  О проекте
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground transition-colors hover:text-foreground">
                  Блог
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} FoodCraftClub. Все права защищены.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
