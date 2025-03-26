"use client";

import React from 'react';
import Link from 'next/link';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import { ShoppingCartIcon, Bars3Icon, UserIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/button';

const Header: React.FC = () => {
  const { isSignedIn, user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">FoodCraftClub</span>
          </Link>
          <nav className="hidden md:flex md:gap-6">
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
              Товары
            </Link>
            <Link href="/sellers" className="text-sm font-medium transition-colors hover:text-primary">
              Продавцы
            </Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              О нас
            </Link>
            {isSignedIn && (
              <Link href="/profile" className="text-sm font-medium transition-colors hover:text-primary">
                Мой профиль
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" aria-label="Корзина">
              <ShoppingCartIcon className="h-5 w-5" />
            </Button>
          </Link>
          
          {isSignedIn ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="ghost" size="icon" aria-label="Профиль" className="hidden sm:flex">
                  <UserIcon className="h-5 w-5" />
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <SignInButton mode="modal">
              <Button>Войти</Button>
            </SignInButton>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Меню"
          >
            <Bars3Icon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Мобильное меню */}
      {mobileMenuOpen && (
        <div className="container md:hidden">
          <nav className="flex flex-col space-y-4 py-4">
            <Link 
              href="/products" 
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Товары
            </Link>
            <Link 
              href="/sellers" 
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Продавцы
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              О нас
            </Link>
            {isSignedIn && (
              <Link 
                href="/profile" 
                className="text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Мой профиль
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
