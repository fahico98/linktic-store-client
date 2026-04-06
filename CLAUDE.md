# CLAUDE.md

Este archivo proporciona orientación a Claude Code (claude.ai/code) cuando trabaja con código en este repositorio.

## Permisos

- **Lectura de archivos**: permitida sin necesidad de confirmación.
- **Consultas en internet** (WebSearch, WebFetch): permitidas sin necesidad de confirmación.

## Comandos

```sh
npm install          # Instalar dependencias
npm run dev          # Iniciar servidor de desarrollo (http://localhost:5173)
npm run build        # Verificación de tipos + build de producción
npm run preview      # Vista previa del build de producción (http://localhost:4173)
npm run type-check   # Ejecutar solo la verificación de tipos con vue-tsc
npm run format       # Formatear src/ con Prettier

# Pruebas unitarias (Vitest + jsdom)
npm run test:unit              # Ejecutar todas las pruebas unitarias (modo watch)
npx vitest run                 # Ejecutar pruebas unitarias una sola vez
npx vitest run src/path/to/file.spec.ts  # Ejecutar un archivo de prueba específico

# Pruebas E2E (Cypress, requiere puerto 4173)
npm run test:e2e:dev   # Abrir Cypress contra el servidor de desarrollo de Vite
npm run test:e2e       # Ejecutar Cypress contra el build de producción
```

## Arquitectura

SPA de Vue 3 + TypeScript scaffoldeada con Vite. Stack principal:

- **Vue 3** con Composition API (`<script setup>`, no Options API)
- **Vue Router 5** — rutas en `src/router/index.ts`; vistas cargadas lazy con `import()` dinámico (excepto HomeView)
- **Pinia 3** — stores en `src/stores/`; estilo Composition API (`defineStore` con función setup que retorna refs/computed/funciones)
- **Nuxt UI 4** — librería de componentes via plugin de Vite `@nuxt/ui/vite`; importa Tailwind CSS automáticamente
- **Tailwind CSS 4** — clases utilitarias en todos los `.vue`
- **vee-validate 4** — validación de formularios (usado en LoginView)
- **axios 1.x** — cliente HTTP con interceptores en `src/lib/axios.ts`
- **@vueuse/core** — utilidades reactivas (useColorMode para dark mode, useDebounceFn para búsqueda)

## Estructura de directorios

```
src/
├── main.ts               # Bootstrap: carga token + cart de localStorage, monta la app
├── App.vue               # Raíz (usa <UApp> de Nuxt UI)
├── router/index.ts       # 7 rutas; guards redirigen usuarios autenticados desde home/login/register
├── stores/
│   ├── auth.ts           # token, user, userAuthenticated (computed); setToken, setUser
│   └── cart.ts           # items, totalItems, totalPrice; addItem, removeItem, updateQuantity, clearCart
├── types/
│   ├── user.ts           # { id, name, email, createdAt?, updatedAt? }
│   ├── product.ts        # { id, name, description, price, images, available_stock }
│   ├── purchase.ts       # { id, price, created_at, products: PurchaseProduct[] }
│   └── purchaseProduct.ts # { id, product, quantity }
├── lib/
│   ├── axios.ts          # Instancia axios (base: VITE_API_URL); interceptor 403 → logout + redirect
│   └── sessions.ts       # Helpers localStorage: saveToken/getToken/removeToken, saveCart/getCart/removeCart
├── views/
│   ├── HomeView.vue      # Landing (no lazy) — CTA para registro/catálogo
│   ├── ProductCatalog.vue # Grilla paginada con búsqueda debounced, selector de cantidad, add-to-cart
│   ├── ShoppingCart.vue  # Resumen de carrito, ajuste de cantidades, checkout → POST /api/purchases
│   ├── UserPurchases.vue # Historial de compras paginado, fechas en zona Colombia
│   └── auth/
│       ├── LoginView.vue    # Form con vee-validate → POST /api/auth/login
│       ├── RegisterView.vue # Wrapper de UserDataForm (mode='create')
│       └── EditUserView.vue # Wrapper de UserDataForm (mode='edit')
├── components/
│   ├── ViewWrapper.vue      # Layout: GlobalNavbar + contenedor principal (w-7xl)
│   ├── GlobalNavbar.vue     # Navbar fija; menú dropdown para autenticados, links simples para no autenticados
│   ├── GlobalPaginator.vue  # Paginación; props: currentPage, totalElements, pageSize; emite @page-change
│   ├── products/
│   │   └── CatalogSearch.vue  # Input con debounce 400ms; emite @search
│   └── users/
│       └── UserDataForm.vue   # Formulario reutilizable create/edit; valida nombre, email, password
└── assets/
    ├── main.css           # Importa Tailwind, Nuxt UI y base.css
    └── base.css           # Variables CSS + capa base
```

## Rutas de la aplicación

| Ruta | Vista | Autenticación |
|---|---|---|
| `/` | HomeView | Redirige a `/product-catalog` si autenticado |
| `/login` | LoginView | Redirige a `/product-catalog` si autenticado |
| `/register` | RegisterView | Redirige a `/product-catalog` si autenticado |
| `/edit-user` | EditUserView | Requiere autenticación |
| `/product-catalog` | ProductCatalog | Requiere autenticación |
| `/shopping-cart` | ShoppingCart | Requiere autenticación |
| `/user-purchases` | UserPurchases | Requiere autenticación |

## API Backend

Base URL: `VITE_API_URL` (`.env`: `http://localhost:8080`)

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Login; retorna token |
| POST | `/api/auth/register` | Registro de usuario |
| GET | `/api/auth/me` | Usuario actual (requiere token) |
| POST | `/api/auth/logout` | Cerrar sesión |
| PUT | `/api/users` | Actualizar perfil |
| GET | `/api/products` | Catálogo paginado (param: `searchText`) |
| GET | `/api/purchases` | Historial de compras paginado |
| POST | `/api/purchases` | Crear compra |

El interceptor de axios limpia la sesión y redirige a `/login` automáticamente ante respuestas 403.

## Patrones de código

### Stores (Pinia)
```ts
export const useMyStore = defineStore('my-store', () => {
  const value = ref<Type | null>(null)
  const computed = computed(() => ...)
  function action() { ... }
  return { value, computed, action }
})
```

### Componentes
- Siempre `<script setup lang="ts">`
- Props con `defineProps<{ prop: Type }>()`
- Emits con `defineEmits<{ (e: 'event', payload: Type): void }>()`
- Notificaciones con el composable `useToast()` de Nuxt UI

### Persistencia de sesión
- Token en localStorage (clave `auth_token`) via `src/lib/sessions.ts`
- Cart en localStorage (clave `cart_items`, JSON serializado)
- Ambos se cargan en `main.ts` al iniciar la app; el cart se persiste con `watch`

### Manejo de imágenes de productos
El campo `images` del backend puede llegar como `string` (JSON) o `string[]`. Parsear así:
```ts
const imgs = Array.isArray(p.images) ? p.images : JSON.parse(p.images ?? '[]')
```

### Formato de fechas y precios
- Fechas: zona horaria `America/Bogota`, locale `es-CO`
- Precios: `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' })`

### Iconos
Usar iconos de Lucide con el patrón `i-lucide-*` como clase de Tailwind (ej. `i-lucide-shopping-cart`).

## Estilo de código

Prettier (`.prettierrc.json`): sin punto y coma, comillas simples, ancho de línea 100.

El alias `@` resuelve a `src/`.

## Nota sobre el servidor de desarrollo

Vite escucha en `0.0.0.0` con file watching por polling — intencional para WSL/Docker.
