# Роли админки: супер-админ и админы по Telegram

## Модель

| Роль | Как получить доступ | Права |
|------|---------------------|--------|
| **superadmin** | Логин `POST /admin/login` (email + пароль из Mongo, создаётся скриптом `create-admin`) | Всё, включая назначение админов по Telegram ID |
| **admin** | Запись в коллекции `telegramadmins` + `POST /admin/auth/telegram` с валидным `X-Telegram-Init-Data` | Те же админские API, **кроме** `GET/POST/DELETE /admin/telegram-admins` |

Проверка прав на сервере: JWT подписан секретом `JWT_SECRET`; клиент только передаёт токен, решение всегда на бэкенде.

## Супер-админ: первый вход

1. Создать учётку (из папки `server/`):

   ```bash
   npx tsx src/create-admin.ts you@example.com StrongPassword
   ```

2. Войти: `POST /admin/login` с телом `{ "email", "password" }`. В ответе `{ "token", "role": "superadmin" }`.

3. Дальше все защищённые запросы: заголовок `Authorization: Bearer <token>`.

## Сессия и профиль

- `GET /admin/me` (с Bearer) — `{ "role", "email?" , "telegramUserId?" }` для отображения UI и проверки роли.

## Назначение админа по Telegram ID (только superadmin)

1. `GET /admin/telegram-admins` — список.
2. `POST /admin/telegram-admins` — тело `{ "telegramUserId": <number> }` (целое &gt; 0). Дубликат → `409`.
3. `DELETE /admin/telegram-admins/:telegramUserId` — удалить из списка.

Узнать свой числовой `user.id` в Telegram можно через [@userinfobot](https://t.me/userinfobot) или логирование `initData` в мини-аппе.

## Вход админа из мини-аппа (Telegram)

1. Супер-админ добавляет пользователя через веб-админку или `POST /admin/telegram-admins`.
2. В мини-аппе передать на сервер заголовок **`X-Telegram-Init-Data`** со значением `window.Telegram.WebApp.initData` (как для публичного `/api`).
3. Запрос:

   ```http
   POST /admin/auth/telegram
   X-Telegram-Init-Data: <строка от Telegram>
   ```

   Успех: `{ "token", "role": "admin" }`. Дальше тот же `Authorization: Bearer <token>` для `/admin/*`.

4. **CORS:** в `CORS_ORIGIN` должен быть origin страницы мини-аппа; в `plugins/cors.ts` уже разрешён заголовок `X-Telegram-Init-Data`.

## Локальная разработка без Telegram

При `NODE_ENV=development` и `DEV_SKIP_TELEGRAM_AUTH=true` плагин подставляет пользователя с `id: 0`. Чтобы проверить `POST /admin/auth/telegram`, в Mongo добавьте документ в `telegramadmins` с `telegramUserId: 0` и валидным `createdByAdminId` (ObjectId существующего документа в коллекции `admins`).

## Обратная совместимость JWT

Старые токены без поля `role`, но с `adminId` и `email`, по-прежнему считаются **superadmin** после `normalizeAdminJwtPayload`. После деплоя лучше один раз перелогиниться, чтобы получить токен с явным `role: "superadmin"`.

## Веб-админка (`admin/`)

После входа по почте супер-админ видит пункт меню **«Админы (Telegram)»**. Обычный Telegram-админ этот раздел и API списка не видит и не может вызвать (ответ `403`).
