# Backend API - Blueberries

Node.js + Express + TypeScript + SQLite бэкенд для маркетплейса Blueberries.

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Разработка (с автоперезагрузкой)
npm run dev

# Сборка
npm run build

# Запуск production версии
npm start
```

## 📡 API Endpoints

### Авторизация

#### `GET /api/auth`
Информация об API авторизации

#### `POST /api/auth/register`
Регистрация нового пользователя

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Иван Иванов"
}
```

**Response:**
```json
{
  "message": "Пользователь успешно зарегистрирован",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Иван Иванов"
  }
}
```

#### `POST /api/auth/login`
Вход в систему

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Успешный вход в систему",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Иван Иванов"
  }
}
```

### Отзывы/Посты

#### `GET /api/posts`
Получить все отзывы (публичный доступ)

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "Отличный товар!",
    "content": "Очень доволен покупкой...",
    "category": "review",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z",
    "email": "user@example.com",
    "user_name": "Иван Иванов"
  }
]
```

#### `GET /api/posts/:id`
Получить отзыв по ID (публичный доступ)

#### `POST /api/posts`
Создать отзыв (требует авторизации)

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Заголовок отзыва",
  "content": "Текст отзыва...",
  "category": "review"
}
```

#### `PUT /api/posts/:id`
Обновить отзыв (только автор)

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Обновленный заголовок",
  "content": "Обновленный текст",
  "category": "review"
}
```

#### `DELETE /api/posts/:id`
Удалить отзыв (только автор)

**Headers:**
```
Authorization: Bearer <token>
```

## 🗄️ База данных

SQLite база данных создается автоматически при первом запуске. Миграции выполняются автоматически.

### Структура БД

**users:**
- `id` (INTEGER PRIMARY KEY)
- `email` (TEXT UNIQUE)
- `password` (TEXT - хешированный)
- `name` (TEXT)
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

**posts:**
- `id` (INTEGER PRIMARY KEY)
- `user_id` (INTEGER, FOREIGN KEY)
- `title` (TEXT)
- `content` (TEXT)
- `category` (TEXT, default: 'review')
- `created_at` (DATETIME)
- `updated_at` (DATETIME)

## 🔐 Безопасность

- Пароли хешируются с помощью bcryptjs (10 раундов)
- JWT токены для аутентификации
- Валидация входных данных
- Проверка прав доступа (только автор может редактировать/удалять свои посты)

## 📝 Переменные окружения

Создайте файл `.env`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-here-change-in-production
JWT_EXPIRES_IN=7d
```

## 🏗️ Структура проекта

```
backend/
├── src/
│   ├── controllers/     # Бизнес-логика
│   │   ├── authController.ts
│   │   └── postsController.ts
│   ├── routes/          # API маршруты
│   │   ├── authRoutes.ts
│   │   └── postsRoutes.ts
│   ├── middleware/      # Express middleware
│   │   └── auth.ts
│   ├── database/       # Работа с БД
│   │   ├── init.ts
│   │   ├── migrations.ts
│   │   └── schema.sql
│   ├── utils/          # Утилиты
│   │   ├── jwt.ts
│   │   └── password.ts
│   └── index.ts        # Точка входа
├── package.json
└── tsconfig.json
```

## 🧪 Тестирование API

Используйте Postman, Insomnia или curl:

```bash
# Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'

# Вход
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Создание поста (замените TOKEN)
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Test","content":"Test content","category":"review"}'
```

