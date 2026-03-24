# HTTP API — mir-noutov (сервер)

Документация для интеграции клиентов (Telegram Mini App, Postman, скрипты). Все пути относительно базового URL.

## Базовый URL и окружение

| Параметр | Значение |
|----------|----------|
| Локально | `http://localhost:3000` (или порт из `PORT` в `server/.env`) |
| Формат | JSON, кодировка UTF-8 |
| Заголовок для JSON | `Content-Type: application/json` (кроме загрузки файла) |

Переменные окружения подхватываются из `server/.env` при старте (см. `config.ts` + `dotenv`).

---

## Два типа авторизации

### 1. Telegram Mini App — маршруты `/api/*`

Все запросы к **`/api/...`** требуют заголовок:

```http
X-Telegram-Init-Data: <строка initData из Telegram.WebApp.initDataUnsafe / window.Telegram.WebApp.initData>
```

Сервер проверяет подпись HMAC (алгоритм Telegram Web Apps) с использованием **`BOT_TOKEN`** из `.env`. Без валидной строки ответ **`401`** с телом вида `{ "message": "Unauthorized" }`.

После успешной проверки в контексте запроса доступен пользователь Telegram (используется при создании заказа).

### 2. Админка — маршруты `/admin/*` (кроме логина)

Для защищённых методов:

```http
Authorization: Bearer <JWT>
```

Токен выдаётся методом **`POST /admin/login`**. Срок жизни задаётся `JWT_EXPIRES_IN` в `.env` (по умолчанию `7d`).

Полезная нагрузка JWT (минимум): `adminId` (строка), `email` (строка). Дополнительно могут быть служебные поля (`iat`, `exp` и т.д.).

---

## Общие ответы об ошибках

| HTTP | Когда | Тело (типично) |
|------|--------|----------------|
| **400** | Ошибка валидации Zod | `{ "message": "Validation error", "errors": { ... } }` |
| **401** | Нет/неверная авторизация (Telegram или JWT) | `{ "message": "Unauthorized" }` или `{ "message": "Invalid credentials" }` (логин) |
| **404** | Не найдено (ресурс или неверный ObjectId / CastError) | `{ "message": "Not found" }` |
| **409** | Дубликат в MongoDB (код 11000) | `{ "message": "Already exists" }` |
| **500** | Внутренняя ошибка | `{ "message": "Internal server error" }` |

Для бизнес-ошибок (`ServiceError`) возможны другие коды (например **400** с `{ "message": "Category not found" }`).

---

## Публичное API — префикс `/api`

Во всех запросах ниже обязателен заголовок **`X-Telegram-Init-Data`**.

### GET `/api/categories`

Список категорий.

**Ответ `200`:** массив объектов:

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Ноутбуки",
    "image": "https://...",
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
]
```

---

### GET `/api/subcategories`

Подкатегории выбранной категории (например «Игровые», «Офисные» внутри «Ноутбуки»).

**Query (обязательно):**

| Параметр | Описание |
|----------|----------|
| `categoryId` | ID родительской категории (Mongo ObjectId строкой) |

**Ответ `200`:** массив:

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "categoryId": "507f1f77bcf86cd799439012",
    "name": "Игровые",
    "image": "https://...",
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
]
```

Уникальность в БД: пара **(categoryId, name)** — повтор того же имени в одной категории даст **409** при создании через админку.

---

### GET `/api/products`

Список товаров.

**Query (все необязательны):**

| Параметр | Описание |
|----------|----------|
| `categoryId` | Фильтр по категории (Mongo ObjectId строкой) |
| `subcategoryId` | Фильтр по подкатегории |
| `search` | Полнотекстовый поиск (`$text` по полям title/description в MongoDB) |

**Ответ `200`:** массив товаров:

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "categoryId": "507f1f77bcf86cd799439012",
    "subcategoryId": "507f1f77bcf86cd799439013",
    "title": "Ноутбук",
    "price": 10000000,
    "currency": "UZS",
    "image": "https://...",
    "description": "...",
    "specs": {},
    "condition": "...",
    "warranty": "...",
    "location": "...",
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-01T12:00:00.000Z"
  }
]
```

Поле `subcategoryId` присутствует, если у товара указана подкатегория. Поля `description`, `specs`, `condition`, `warranty`, `location` могут отсутствовать.

---

### GET `/api/products/:id`

Один товар по `id`.

**Ответ `200`:** объект как в списке товаров.

**Ошибки:** `404` если товар не найден.

---

### GET `/api/delivery-options`

Список способов доставки из БД (после `npm run seed` типичные `id`):

| `id` | Примечание |
|------|------------|
| `courier` | Курьер |
| `pickup` | Самовывоз |

**Ответ `200`:**

```json
[
  {
    "id": "courier",
    "name": "Курьер",
    "price": 20000,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### GET `/api/payment-options`

Способы оплаты. После seed типичные `id`: `cash`, `payme`, `click`.

**Ответ `200`:**

```json
[
  {
    "id": "cash",
    "name": "Наличные",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### POST `/api/orders`

Создание заказа от имени пользователя Telegram (идентификатор берётся из проверенного `initData`).

**Тело (JSON):**

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `items` | массив | да | Минимум 1 элемент |
| `items[].productId` | string | да | ID товара в MongoDB |
| `items[].quantity` | number (целое ≥ 1) | да | Количество |
| `phone` | string | да | Минимум 9 символов |
| `address` | object | да | Все вложенные поля обязательны |
| `address.district` | string | да | |
| `address.street` | string | да | |
| `address.apartment` | string | да | |
| `address.floor` | string | да | |
| `deliveryId` | string | да | Должен существовать в `delivery-options` |
| `paymentId` | string | да | Должен существовать в `payment-options` |
| `comments` | string | нет | |

**Пример:**

```json
{
  "items": [
    { "productId": "507f1f77bcf86cd799439011", "quantity": 1 }
  ],
  "phone": "+998901234567",
  "address": {
    "district": "Чиланзар",
    "street": "ул. Пример, 1",
    "apartment": "10",
    "floor": "3"
  },
  "deliveryId": "courier",
  "paymentId": "cash",
  "comments": "Позвонить за час"
}
```

**Ответ `201`:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "status": "pending",
  "total": 10020000,
  "createdAt": "2025-01-01T12:00:00.000Z"
}
```

**Ошибки:** `400` если товар не найден, неверные `deliveryId`/`paymentId` и т.п. (текст в `message`).

---

## Админское API — префикс `/admin`

### POST `/admin/login`

Без JWT. Выдаёт токен для остальных методов.

**Тело:**

```json
{
  "email": "admin@example.com",
  "password": "secret"
}
```

`email` должен быть валидным email (Zod `.email()`).

**Ответ `200`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ответ `401`:** `{ "message": "Invalid credentials" }` — одинаково для неверного email и пароля.

---

### Подкатегории (нужен `Authorization: Bearer <token>`)

| Метод | Путь | Описание |
|--------|------|----------|
| GET | `/admin/subcategories` | Список; query: `categoryId?` — если не указан, возвращаются все подкатегории |
| GET | `/admin/subcategories/:id` | Одна подкатегория |
| POST | `/admin/subcategories` | Создание |
| PUT | `/admin/subcategories/:id` | Частичное обновление |
| DELETE | `/admin/subcategories/:id` | Удаление |

**POST тело:** `{ "categoryId": "...", "name": "Игровые", "image": "https://..." }` — `categoryId` должен существовать.

---

### Товары (нужен `Authorization: Bearer <token>`)

| Метод | Путь | Описание |
|--------|------|----------|
| GET | `/admin/products` | Список; query: `categoryId?`, `subcategoryId?`, `search?` |
| GET | `/admin/products/:id` | Один товар |
| POST | `/admin/products` | Создание |
| PUT | `/admin/products/:id` | Частичное обновление (все поля опциональны в теле) |
| DELETE | `/admin/products/:id` | Удаление |

**POST `/admin/products` — тело (обязательные поля согласно Zod):**

| Поле | Обязательно |
|------|----------------|
| `categoryId`, `title`, `price`, `image` | да |
| `subcategoryId`, `currency`, `description`, `specs`, `condition`, `warranty`, `location` | нет |

`categoryId` должен существовать в БД, иначе **400** `Category not found`. Если передан `subcategoryId`, он должен принадлежать той же категории, иначе **400** (`Subcategory not found` / `Subcategory does not belong to category`).

**PUT:** можно сбросить подкатегорию, передав `"subcategoryId": null`.

**Ответы:** `201` при создании; `204` при удалении без тела; `404` если товар не найден.

---

### Категории (нужен Bearer)

| Метод | Путь | Описание |
|--------|------|----------|
| GET | `/admin/categories` | Список |
| POST | `/admin/categories` | Создание |
| PUT | `/admin/categories/:id` | Обновление (частичное) |
| DELETE | `/admin/categories/:id` | Удаление |

**POST тело:** `{ "name": "...", "image": "https://..." }`

---

### Заказы (нужен Bearer)

| Метод | Путь | Описание |
|--------|------|----------|
| GET | `/admin/orders` | Список; query: `status?` (`pending`, `confirmed`, …) |
| GET | `/admin/orders/:id` | Один заказ |
| PATCH | `/admin/orders/:id/status` | Смена статуса |

**PATCH тело:**

```json
{ "status": "confirmed" }
```

Допустимые значения: `pending`, `confirmed`, `delivering`, `done`, `cancelled`.

**Ответ `200` для заказа** — объект:

```json
{
  "id": "...",
  "telegramId": "123456789",
  "phone": "+998...",
  "address": {
    "district": "...",
    "street": "...",
    "apartment": "...",
    "floor": "..."
  },
  "deliveryId": "courier",
  "paymentId": "cash",
  "comments": "...",
  "status": "pending",
  "total": 10020000,
  "items": [
    {
      "productId": "...",
      "title": "...",
      "price": 10000000,
      "quantity": 1
    }
  ],
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### POST `/admin/upload`

Загрузка файла в Cloudflare R2 (нужен Bearer).

**Формат:** `multipart/form-data`, поле файла: **`file`**.

**Ответ `200`:**

```json
{ "url": "https://<R2_PUBLIC_URL>/<uuid>.<ext>" }
```

**Ошибки:** `400` если поле `file` не передано; при сбое R2/сети возможен **500**.

---

## CORS

Разрешённые методы: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`.

Разрешённые заголовки включают: `Content-Type`, `Authorization`, `X-Telegram-Init-Data`.

`origin` задаётся переменной **`CORS_ORIGIN`** в `.env`: `*`, один URL или **несколько через запятую** (например `http://localhost:5173,http://localhost:5174` для основного фронта и админки).

---

## Postman: типовой сценарий

1. **Переменная окружения** `baseUrl` = `http://localhost:3000`.
2. **Админка:** `POST {{baseUrl}}/admin/login` → скопировать `token` → для остальных запросов **Authorization → Bearer Token**.
3. **Публичное API:** в **Headers** добавить `X-Telegram-Init-Data` со значением реальной строки из Telegram Web App (подпись должна совпадать с `BOT_TOKEN`). Без реального Mini App проще тестировать **`/admin/*`**, а **`/api/*`** — из клиента или отдельного скрипта, генерирующего валидный `initData`.

---

## Подготовка данных (напоминание)

```bash
cd server
npm install
# заполнить .env
npm run seed
npm run create-admin -- admin@example.com YourPassword
npm run dev
```

После `seed` в БД появятся доставка, оплата и четыре категории из `seed.ts`.

---

*Документ соответствует коду в `server/src` на момент создания. При изменении роутов обновляйте этот файл.*
