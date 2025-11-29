# Схема базы данных Blueberries

## Описание

База данных SQLite для маркетплейса Blueberries. Содержит таблицы для пользователей и отзывов/товаров.

## Таблицы

### users - Пользователи

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ, автоинкремент |
| email | TEXT | Email пользователя (уникальный) |
| password | TEXT | Хешированный пароль |
| name | TEXT | Имя пользователя (опционально) |
| created_at | DATETIME | Дата создания записи |
| updated_at | DATETIME | Дата последнего обновления |

**Индексы:**
- `idx_users_email` - индекс по email для быстрого поиска

**Триггеры:**
- `update_users_timestamp` - автоматически обновляет `updated_at` при изменении записи

### posts - Отзывы/Товары

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER | Первичный ключ, автоинкремент |
| user_id | INTEGER | Внешний ключ к users.id |
| title | TEXT | Заголовок отзыва/товара |
| content | TEXT | Содержание отзыва/товара |
| category | TEXT | Категория (по умолчанию 'review') |
| created_at | DATETIME | Дата создания записи |
| updated_at | DATETIME | Дата последнего обновления |

**Внешние ключи:**
- `user_id` → `users(id)` ON DELETE CASCADE

**Индексы:**
- `idx_posts_user_id` - индекс по user_id для быстрого поиска по пользователю
- `idx_posts_created_at` - индекс по дате создания для сортировки

**Триггеры:**
- `update_posts_timestamp` - автоматически обновляет `updated_at` при изменении записи

## Миграции

Система миграций позволяет версионировать изменения схемы БД:

1. **001_initial_schema** - создание таблицы users
2. **002_create_posts_table** - создание таблицы posts
3. **003_create_indexes** - создание индексов для оптимизации

## Связи

```
users (1) ────< (N) posts
```

Один пользователь может иметь множество отзывов/товаров. При удалении пользователя все его записи удаляются автоматически (CASCADE).

## Примеры запросов

### Получить все отзывы пользователя
```sql
SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC;
```

### Получить пользователя с его отзывами
```sql
SELECT u.*, p.* 
FROM users u 
LEFT JOIN posts p ON u.id = p.user_id 
WHERE u.id = ?;
```

### Получить последние 10 отзывов
```sql
SELECT p.*, u.email, u.name 
FROM posts p 
JOIN users u ON p.user_id = u.id 
ORDER BY p.created_at DESC 
LIMIT 10;
```

