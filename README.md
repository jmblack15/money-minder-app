# Money Minder — App Móvil

Frontend móvil de la app de finanzas personales, construida con React Native + Expo.

## Stack tecnológico

| Tecnología | Uso |
|---|---|
| Expo SDK 51 | Framework base |
| Expo Router v3 | Navegación basada en archivos |
| Zustand | Estado global (auth, finanzas) |
| TanStack Query v5 | Fetching, caché y mutaciones |
| Victory Native | Gráficas (pie chart, bar chart) |
| React Hook Form + Zod | Formularios y validación |
| Expo SecureStore | Almacenamiento seguro de JWT |
| NativeWind + Tailwind | Estilos |
| Axios | Cliente HTTP con interceptors JWT |

---

## Requisitos previos

- Node.js 18+
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Backend corriendo en `http://localhost:3000` (ver repo `money-minder-server`)

---

## Instalación

```bash
# 1. Clonar / navegar al proyecto
cd money-minder-app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env si tu backend corre en otra URL

# 4. Iniciar el servidor de desarrollo
npm start
```

Luego escanea el QR con **Expo Go** (iOS/Android) o presiona `i` para iOS simulator / `a` para Android emulator.

---

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | URL base del backend | `http://localhost:3000` |

> Las variables con prefijo `EXPO_PUBLIC_` quedan expuestas en el bundle. No guardes secretos aquí.

---

## Estructura del proyecto

```
money-minder-app/
├── app/
│   ├── _layout.tsx              # Root layout (QueryClient + GestureHandler)
│   ├── index.tsx                # Redirect según auth state
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (app)/
│       ├── _layout.tsx          # Tab navigator principal
│       ├── index.tsx            # Dashboard
│       ├── transactions/
│       │   ├── index.tsx        # Lista con scroll infinito
│       │   ├── new.tsx          # Crear transacción
│       │   └── [id].tsx         # Detalle / editar
│       ├── budgets/
│       │   ├── index.tsx
│       │   └── new.tsx
│       ├── savings/
│       │   ├── index.tsx
│       │   └── new.tsx
│       ├── reports/
│       │   └── index.tsx
│       └── accounts/
│           ├── index.tsx
│           └── new.tsx
├── components/
│   ├── ui/                      # Button, Input, Card, Badge, etc.
│   ├── charts/                  # PieChart, BarChart (Victory Native)
│   ├── transactions/            # TransactionCard, TransactionList
│   └── budgets/                 # BudgetCard
├── constants/
│   ├── colors.ts                # Paleta de colores
│   └── categories.ts            # Categorías, tipos de cuenta, colores
├── hooks/
│   ├── useTransactions.ts       # Infinite query + mutaciones
│   ├── useBudgets.ts
│   ├── useAccounts.ts
│   ├── useSavings.ts
│   ├── useReports.ts
│   └── useCategories.ts
├── services/
│   ├── api.ts                   # Axios instance + interceptors JWT
│   ├── auth.ts
│   ├── transactions.ts
│   ├── budgets.ts
│   ├── accounts.ts
│   ├── savings.ts
│   ├── categories.ts
│   └── reports.ts
├── store/
│   ├── authStore.ts             # Zustand: user, tokens, login, logout
│   └── financeStore.ts          # Zustand: accounts, categories, filtros
└── types/
    └── index.ts                 # Interfaces TypeScript compartidas
```

---

## Flujo de autenticación

1. Al arrancar, `authStore.initialize()` lee los tokens de SecureStore.
2. Si hay tokens válidos → redirige a `/(app)`.
3. Si no → redirige a `/(auth)/login`.
4. En cada request, `api.ts` agrega `Authorization: Bearer <access_token>`.
5. Si la respuesta es 401, el interceptor llama a `/auth/refresh` automáticamente.
6. Si el refresh falla, limpia tokens y redirige a login.

---

## Características implementadas

- **Auth**: Login, registro, logout, refresh automático de tokens
- **Dashboard**: Balance total, cuentas (scroll horizontal), resumen del mes, últimas transacciones, FAB
- **Transacciones**: Lista con paginación infinita, filtros por tipo, detalle/edición, eliminación
- **Nueva transacción**: Selector tipo (tabs), input de monto prominente, selector cuenta/categoría/fecha
- **Presupuestos**: Cards con barra de progreso animada, colores dinámicos (verde/amarillo/rojo), badge de estado
- **Metas de ahorro**: Progreso por meta, días restantes, modal para abonar, eliminación
- **Reportes**: Selector de período, pie chart por categoría, bar chart mensual, top 5 categorías
- **Cuentas**: Lista con balance total, color por cuenta, formulario con selector de color

---

## Scripts disponibles

```bash
npm start          # Iniciar Expo dev server
npm run android    # Abrir en Android emulator
npm run ios        # Abrir en iOS simulator
npm run web        # Abrir en navegador
npm run lint       # ESLint
```

---

## Conexión con el backend

El backend debe exponer los siguientes endpoints (ver `CONTEXT.md`):

- `POST /api/auth/login` / `register` / `refresh` / `logout`
- `GET|POST|PUT|DELETE /api/accounts`
- `GET|POST|PUT|DELETE /api/transactions`
- `GET|POST /api/categories`
- `GET|POST|PUT|DELETE /api/budgets`
- `GET|POST|PUT|DELETE /api/savings`
- `GET /api/reports/summary|by-category|monthly-trend|account-balances`

Todas las respuestas siguen el formato `{ success, data, message }`.
