# Табличкин 🕷️📋

Многопользовательское приложение для работы с электронными таблицами.  
Выполнено в детском/радужном стиле с использованием шрифта The Amazing Spider-Man.

## Стек технологий

- **React 19** + **TypeScript 6** (strict mode)
- **Redux Toolkit** — управление состоянием
- **React Router DOM** — маршрутизация (SPA)
- **Vite 8** — сборка и dev-сервер
- **Vitest 4** + **@testing-library/react** — тесты
- **ESLint** + **Prettier** — линтинг и форматирование

## Функциональность

### Таблица
- Создание, редактирование и удаление ячеек
- Формулы: `=SUM(A1:B3)`, `=AVERAGE(...)`, арифметика `=A1+B2*3`
- Форматирование: жирный, курсив, подчёркнутый, цвет текста/фона, выравнивание
- Контекстное меню: добавить/удалить строку/столбец
- Изменение размеров строк и столбцов
- Undo/Redo (Ctrl+Z / Ctrl+Y)

### Горячие клавиши
- `Ctrl+B` — жирный
- `Ctrl+I` — курсив
- `Ctrl+U` — подчёркнутый
- `Ctrl+Z` — отмена
- `Ctrl+Y` — повтор
- `Ctrl+S` — сохранить
- `Delete` — очистить ячейки

### Документы
- Дашборд со списком документов
- Создание, переименование, дублирование, удаление документов
- Автосохранение

### Экспорт/Импорт
- Скачать как CSV
- Скачать как JSON
- Загрузить из CSV

### Авторизация
- Регистрация и вход (mock API)
- Защищённые маршруты
- Профиль пользователя: смена имени и пароля

## Скрипты

```bash
npm run dev          # Dev-сервер
npm run build        # Сборка (typecheck + vite build)
npm run test         # Запуск тестов
npm run test:watch   # Тесты в watch-режиме
npm run typecheck    # Проверка типов
npm run lint         # ESLint
npm run format       # Prettier (запись)
npm run format:check # Prettier (проверка)
```

## Структура проекта

```
src/
├── api/              # Mock API (auth, documents)
├── assets/fonts/     # The Amazing Spider-Man шрифт
├── components/
│   ├── Auth/         # ProtectedRoute
│   ├── Layout/       # AppLayout, Breadcrumbs
│   ├── Table/        # Table, Cell, FormulaBar, ContextMenu
│   ├── FormattingToolbar
│   ├── DocumentCard
│   ├── CreateDocModal
│   └── SaveIndicator
├── hooks/            # useHotkeys
├── pages/            # Dashboard, Spreadsheet, Login, Register, Profile, 404
├── store/            # Redux slices (spreadsheet, documents, auth, ui)
├── types/            # TypeScript интерфейсы
└── utils/            # formulas, csv, cellHelpers
```

## Тесты

44 теста в 10 файлах:
- Redux-слайсы (spreadsheet, documents, auth, ui)
- Утилиты (formulas, csv)
- Компоненты (Cell, FormattingToolbar)
- Страницы (LoginPage)
- Хуки (useHotkeys)

## Автор

**К. Йолчиев** (uiopl2006@gmail.com)
