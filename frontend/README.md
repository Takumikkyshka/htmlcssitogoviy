# Blueberries - Frontend

React приложение для маркетплейса Blueberries, созданное с использованием Vite.

## Технологии

- **React 18** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик и dev-сервер
- **React Router** - маршрутизация
- **CSS3** - стилизация с градиентами и анимациями

## Структура проекта

```
frontend/
├── public/
│   └── assets/          # Статические файлы (изображения, видео, аудио)
├── src/
│   ├── components/      # React компоненты
│   │   ├── Header.tsx
│   │   ├── PromoBanner.tsx
│   │   ├── SearchSection.tsx
│   │   ├── Products.tsx
│   │   ├── MusicSection.tsx
│   │   └── Footer.tsx
│   ├── styles/          # CSS стили
│   │   └── defaultstyles.css
│   ├── App.tsx          # Главный компонент приложения
│   └── main.tsx         # Точка входа
├── index.html
├── vite.config.ts
└── package.json
```

## Установка и запуск

### Установка зависимостей
```bash
npm install
```

### Запуск dev-сервера
```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

### Сборка для production
```bash
npm run build
```

### Просмотр production сборки
```bash
npm run preview
```

## Компоненты

- **Header** - навигация с логотипом и меню
- **PromoBanner** - баннер распродажи
- **SearchSection** - поиск и фильтры по категориям
- **Products** - секция с популярными товарами
- **MusicSection** - секция с музыкой и подпиской
- **Footer** - футер с контактами и формой обратной связи

## Особенности

- Адаптивный дизайн (Mobile First)
- Градиентный фон с анимацией
- Эффекты glassmorphism
- CSS анимации и transitions
- React Router для навигации

