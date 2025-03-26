"use client";

import React, { createContext, useContext, useEffect } from 'react';
import posthog from 'posthog-js';

type AnalyticsContextType = {
  captureEvent: (eventName: string, properties?: Record<string, any>) => void;
};

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Инициализация PostHog только на клиенте и только в production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
        // Отключаем автоматическое отслеживание для большего контроля
        autocapture: false,
        // Отключаем отслеживание сессий для соответствия GDPR
        capture_pageview: false,
        // Отключаем отслеживание ошибок
        capture_pageleave: false,
      });
    }

    return () => {
      // Очистка при размонтировании
      if (typeof window !== 'undefined') {
        posthog.reset();
      }
    };
  }, []);

  const captureEvent = (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      posthog.capture(eventName, properties);
    } else {
      // В режиме разработки просто логируем события
      console.log(`[Analytics] ${eventName}`, properties);
    }
  };

  return (
    <AnalyticsContext.Provider value={{ captureEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
