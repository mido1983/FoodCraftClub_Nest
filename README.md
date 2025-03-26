# FoodCraftClub Marketplace

Онлайн-маркетплейс, где пользователи могут покупать продукты от различных продавцов.

## Технологический стек

### Backend
- **NestJS** - основной фреймворк
- **Prisma ORM** - для работы с базой данных
- **MySQL** - база данных

### Frontend
- **Next.js** - фреймворк для фронтенда
- **shadcn/ui** - библиотека UI-компонентов
- **TailwindCSS** - для стилизации
- **@heroicons/react** - иконки

### Внешние сервисы
- **Clerk.dev** - аутентификация пользователей
- **Stripe Billing** - подписки и платежи
- **Directus** - headless CMS для управления контентом
- **PostHog/Metabase** - аналитика

## Структура проекта

```
├── backend/                # NestJS бэкенд
│   ├── prisma/            # Prisma схема и миграции
│   ├── src/               # Исходный код
│   │   ├── modules/       # Модули приложения
│   │   │   ├── clerk/     # Интеграция с Clerk.dev
│   │   │   ├── directus/  # Интеграция с Directus
│   │   │   ├── logger/    # Логирование
│   │   │   ├── orders/    # Управление заказами
│   │   │   ├── prisma/    # Prisma сервис
│   │   │   ├── products/  # Управление продуктами
│   │   │   └── stripe/    # Интеграция со Stripe
│   │   ├── interceptors/  # Интерцепторы
│   │   ├── filters/       # Фильтры исключений
│   │   └── middleware/    # Middleware
│   ├── .env               # Переменные окружения
│   └── package.json       # Зависимости
└── frontend/             # Next.js фронтенд (будет добавлен позже)
```

## Установка и запуск

### Предварительные требования
- Node.js (v18+)
- MySQL
- Clerk.dev аккаунт
- Stripe аккаунт
- Directus (установленный локально или облачный)

### Backend

1. Установите зависимости:
```bash
cd backend
npm install
```

2. Настройте переменные окружения:
```bash
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

3. Сгенерируйте Prisma клиент:
```bash
npx prisma generate
```

4. Запустите миграции базы данных:
```bash
npx prisma migrate dev
```

5. Запустите сервер:
```bash
npm run start:dev
```

### Frontend (будет добавлен позже)

## Основные функции

- **Аутентификация пользователей** через Clerk.dev
- **Управление продуктами** через Directus CMS
- **Оформление заказов** с интеграцией Stripe для платежей
- **VIP-подписки** для покупателей и продавцов через Stripe Billing
- **Система баллов** для лояльности клиентов

## API Endpoints

### Webhook Endpoints
- `POST /webhooks/clerk` - Обработка вебхуков от Clerk.dev
- `POST /webhooks/stripe` - Обработка вебхуков от Stripe
- `POST /webhooks/directus` - Обработка вебхуков от Directus

### Products API
- `GET /products` - Получение списка продуктов
- `GET /products/:id` - Получение информации о продукте

### Orders API
- `POST /orders` - Создание заказа
- `GET /orders` - Получение списка заказов пользователя
- `GET /orders/:id` - Получение информации о заказе
- `PATCH /orders/:id/status` - Обновление статуса заказа

## Безопасность

- Все API-запросы защищены аутентификацией через Clerk.dev
- Все ответы API форматируются в единый формат JSON
- Логирование всех ключевых событий и ошибок
- CORS настроен для защиты от несанкционированного доступа

## Логирование

Все логи сохраняются в директории `logs/`:
- `debug.log` - отладочная информация
- `errors.log` - ошибки
- `actions.log` - действия пользователей
