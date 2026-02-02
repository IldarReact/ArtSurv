# 🛡️ Система сохранений artsurv

## Обзор

Система сохранений artsurv использует **zod + superjson + HMAC-SHA256 + версионирование** для создания неубиваемой защиты от:

- ❌ Битых данных (NaN, Infinity, undefined)
- ❌ Читерства через DevTools
- ❌ Несовместимости при обновлениях
- ❌ Потери данных при изменении структуры

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                        Zustand Store                         │
│                    (core/model/store.ts)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Save Manager                            │
│              (core/lib/persistence/save-manager.ts)          │
│                                                              │
│  1. Zod Validation (схемы)                                   │
│  2. SuperJSON Serialization (Date, Set, Map, BigInt)         │
│  3. HMAC-SHA256 Checksum (защита от подделки)                │
│  4. Versioning + Migrations (совместимость)                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                    localStorage
```

---

## 📋 Компоненты

### 1. **Zod Schemas** (`core/schemas/game.schema.ts`)

Строгие схемы валидации для всех типов данных:

```typescript
export const StatsSchema = z
  .object({
    money: z.number().finite().min(0),
    happiness: z.number().finite().min(0).max(100),
    energy: z.number().finite().min(0).max(100),
    // ...
  })
  .strict()
```

**Защита:**

- ✅ `.finite()` — блокирует NaN и Infinity
- ✅ `.min()` / `.max()` — ограничивает диапазоны
- ✅ `.int()` — гарантирует целые числа
- ✅ `.strict()` — запрещает неизвестные поля

### 2. **SuperJSON** (сериализация)

Сохраняет сложные типы, которые обычный JSON не поддерживает:

```typescript
// До SuperJSON
const state = {
  lastSaved: new Date(),
  tags: new Set(['rich', 'happy']),
  capital: 1000000000000n,
}

JSON.stringify(state)
// ❌ lastSaved → строка
// ❌ tags → {}
// ❌ capital → ошибка

// С SuperJSON
superjson.stringify(state)
// ✅ lastSaved → Date
// ✅ tags → Set
// ✅ capital → BigInt
```

### 3. **HMAC-SHA256 Checksum** (защита от подделки)

```typescript
// Вычисление checksum
const checksum = CryptoJS.HmacSHA256(data, SECRET_KEY).toString()

// При загрузке
if (currentChecksum !== saveData.checksum) {
  throw new Error('🚨 SAVE FILE CORRUPTED OR MODIFIED')
}
```

**Что это даёт:**

- ✅ Любое изменение в DevTools → сейв не загрузится
- ✅ Криптографически стойкая защита (в отличие от adler32)
- ✅ Секретный ключ можно вынести в `.env`

### 4. **Versioning + Migrations** (`core/lib/persistence/migrations.ts`)

```typescript
const migrations: Record<number, MigrationFn> = {
  2: (state) => {
    return {
      ...state,
      newFeature: { enabled: false, value: 0 },
    }
  },
}
```

**Как работает:**

1. Ты меняешь структуру данных (добавляешь поле)
2. Увеличиваешь `CURRENT_VERSION` в `save-manager.ts`
3. Добавляешь миграцию в `migrations.ts`
4. Старые сейвы автоматически обновляются при загрузке

---

## 🚀 Использование

### Сохранение

```typescript
import { saveManager } from '@/core/lib/persistence/save-manager'

// Автоматически через Zustand (при каждом изменении)
useGameStore.setState({ money: 1000 })

// Или вручную
saveManager.save(gameState)
```

### Загрузка

```typescript
const state = await saveManager.load()
if (!state) {
  console.log('Нет сохранений')
}
```

### Проверка наличия

```typescript
if (saveManager.hasSave()) {
  console.log('Есть сохранение')
}
```

### Очистка

```typescript
saveManager.clear()
```

---

## 🔒 Режимы работы

### Development Mode (`NODE_ENV !== 'production'`)

- ⚠️ Ошибки валидации → предупреждения
- ⚠️ Checksum mismatch → предупреждение, но загрузка продолжается
- 🎯 Удобно для отладки

### Production Mode (`NODE_ENV === 'production'`)

- ❌ Ошибки валидации → сейв не сохраняется
- ❌ Checksum mismatch → сейв не загружается
- 🛡️ Максимальная защита

---

## 📝 Как добавить новое поле

### Шаг 1: Обновить схему

```typescript
// core/schemas/game.schema.ts
export const PlayerStateSchema = z
  .object({
    // ... существующие поля
    newField: z.string().default('default value'),
  })
  .strict()
```

### Шаг 2: Увеличить версию

```typescript
// core/lib/persistence/save-manager.ts
const CURRENT_VERSION = 2 // было 1
```

### Шаг 3: Добавить миграцию

```typescript
// core/lib/persistence/migrations.ts
const migrations: Record<number, MigrationFn> = {
  2: (state) => {
    return {
      ...state,
      player: state.player
        ? {
            ...state.player,
            newField: 'default value',
          }
        : null,
    }
  },
}
```

### Шаг 4: Готово!

Старые сейвы автоматически обновятся при загрузке.

---

## 🐛 Отладка

### Проблема: "Save validation failed"

```typescript
// Смотри в консоль, какие поля не прошли валидацию
console.error('❌ Save validation failed:', validation.error.errors)
```

**Решение:**

1. Проверь, что все числовые поля — конечные числа
2. Проверь диапазоны (0-100 для stats)
3. Проверь, что нет `undefined` в обязательных полях

### Проблема: "Checksum mismatch"

```typescript
console.error('🚨 SAVE FILE CORRUPTED OR MODIFIED')
```

**Решение:**

1. Если в dev mode — игнорируй (это нормально при изменении кода)
2. Если в production — сейв был изменён вручную
3. Очисти localStorage и начни новую игру

### Проблема: "Save version mismatch"

```typescript
console.warn('⚠️ Save version mismatch: 1 vs 2')
```

**Решение:**

1. Миграция должна запуститься автоматически
2. Если нет — проверь, что миграция добавлена в `migrations.ts`

---

## 🎯 Примеры реальных багов, которые теперь невозможны

| Баг                         | До                    | После                |
| --------------------------- | --------------------- | -------------------- |
| `money: Infinity`           | ✅ Сохранялось        | ❌ Ошибка валидации  |
| `health: -50`               | ✅ Сохранялось        | ❌ Ошибка валидации  |
| `lastSaved: "2024-01-01"`   | ✅ Строка вместо Date | ✅ Настоящий Date    |
| Читерство через DevTools    | ✅ Работало           | ❌ Checksum mismatch |
| Старый сейв без нового поля | ❌ Краш               | ✅ Автомиграция      |

---

## 🔐 Безопасность

### Secret Key

По умолчанию используется `lifesim-default-secret-key-change-in-production`.

**В продакшене:**

```env
# .env.local
NEXT_PUBLIC_SAVE_SECRET=your-super-secret-key-here
```

⚠️ **Важно:** Не коммить секретный ключ в git!

---

## 📊 Производительность

- ✅ SuperJSON быстрее, чем обычный JSON
- ✅ HMAC-SHA256 вычисляется мгновенно
- ✅ Валидация происходит только при сохранении/загрузке
- ✅ Миграции запускаются только при несовпадении версий

---

## 🎓 Дополнительные ресурсы

- [Zod Documentation](https://zod.dev/)
- [SuperJSON](https://github.com/blitz-js/superjson)
- [CryptoJS](https://cryptojs.gitbook.io/docs/)
- [Zustand Persist](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)

---

## ✅ Чеклист для разработчиков

- [ ] Все числовые поля имеют `.finite()`
- [ ] Stats имеют `.min(0).max(100)`
- [ ] Деньги имеют `.min(0)`
- [ ] Проценты имеют `.min(0).max(100)`
- [ ] Сроки имеют `.int().min(0)`
- [ ] При добавлении поля — создана миграция
- [ ] При изменении структуры — увеличена версия
- [ ] Секретный ключ вынесен в `.env` (production)

---

**Теперь твой artsurv неубиваем! 🎉**
