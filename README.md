# Linktic Store — Frontend

SPA de e-commerce construida con Vue 3 + TypeScript. Permite a los usuarios explorar un catálogo de productos, gestionar un carrito de compras y consultar su historial de pedidos.

---

## Instalación con Docker

El primer paso para levantar los contenedores docker que servirán toda la aplicación (backend, frontend y base de datos) es organizar el sistema de carpetas de todo el proyecto: Este repositorio debe ubicarse en la misma carpeta en la cual se aloja la aplicación backend (que puedes clonar desde el repositorio https://github.com/fahico98/linktic-store-api) para luego mover el archivo `docker-compose.yml` que está dentro del repositorio de la aplicación backend a la carpeta donde están los dos proyectos:

```bash
directorio-del-proyecto/
├── docker-compose.yml
├── backend/   # repositorio del backend
└── frontend/  # este repositorio (frontend)
```

Los nombres de los directorios `frontend` y `backend` son obligatorios, si se les ponen nombres diferentes deberán hacerse las correcciones pertinentes en
el archivo `docker-compose.yml`.

Desde la ruta de la carpeta `directorio-del-proyecto` se debe ejecutar el comando:

```bash
docker compose up --build
```

| Servicio   | URL                   |
| ---------- | --------------------- |
| Backend    | http://localhost:8080 |
| Frontend   | http://localhost:5173 |
| PostgreSQL | localhost:**5433**    |

Al iniciar en perfil `dev`, la app puebla automáticamente la base de datos con usuarios, productos y compras de prueba.

## Instalación local

**Requisitos:** Node.js `^20.19.0` o `>=22.12.0`

```sh
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env   # o crear .env manualmente
# Editar VITE_API_URL con la URL del backend

# 3. Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## Scripts disponibles

```sh
npm run dev          # Servidor de desarrollo con hot-reload (puerto 5173)
npm run build        # Verificación de tipos + build de producción en dist/
npm run preview      # Vista previa del build de producción (puerto 4173)
npm run type-check   # Solo verificación de tipos con vue-tsc
npm run format       # Formatear src/ con Prettier
```

---

## Stack tecnológico

| Tecnología   | Versión | Rol                                         |
| ------------ | ------- | ------------------------------------------- |
| Vue 3        | ^3.5    | Framework principal (Composition API)       |
| TypeScript   | ~6.0    | Tipado estático                             |
| Vite         | ^8.0    | Bundler y servidor de desarrollo            |
| Vue Router   | ^5.0    | Enrutamiento SPA                            |
| Pinia        | ^3.0    | Gestión de estado global                    |
| Nuxt UI      | ^4.6    | Librería de componentes + Tailwind CSS      |
| Tailwind CSS | ^4.2    | Estilos utilitarios                         |
| Axios        | ^1.14   | Cliente HTTP                                |
| vee-validate | ^4.15   | Validación de formularios                   |
| @vueuse/core | —       | Utilidades reactivas (debounce, color mode) |
| Vitest       | ^4.1    | Pruebas unitarias                           |
| Cypress      | ^15.13  | Pruebas E2E                                 |

---

## Estructura del proyecto

```
src/
├── main.ts               # Bootstrap: carga sesión y carrito desde localStorage
├── App.vue               # Componente raíz
├── router/index.ts       # Definición de rutas y guards de navegación
├── stores/
│   ├── auth.ts           # Estado de autenticación (token, usuario)
│   └── cart.ts           # Estado del carrito de compras
├── types/                # Interfaces TypeScript (User, Product, Purchase…)
├── lib/
│   ├── axios.ts          # Instancia de axios con interceptores
│   └── sessions.ts       # Helpers de localStorage para token y carrito
├── views/                # Páginas de la aplicación
│   ├── HomeView.vue      # Landing page
│   ├── ProductCatalog.vue
│   ├── ShoppingCart.vue
│   ├── UserPurchases.vue
│   └── auth/             # Login, Registro, Editar perfil
└── components/           # Componentes reutilizables
    ├── ViewWrapper.vue   # Layout general (navbar + contenedor)
    ├── GlobalNavbar.vue
    ├── GlobalPaginator.vue
    ├── products/CatalogSearch.vue
    └── users/UserDataForm.vue
```

---

## Rutas de la aplicación

| Ruta               | Vista          | Acceso                            |
| ------------------ | -------------- | --------------------------------- |
| `/`                | HomeView       | Público (redirige si autenticado) |
| `/login`           | LoginView      | Público (redirige si autenticado) |
| `/register`        | RegisterView   | Público (redirige si autenticado) |
| `/product-catalog` | ProductCatalog | Requiere autenticación            |
| `/shopping-cart`   | ShoppingCart   | Requiere autenticación            |
| `/user-purchases`  | UserPurchases  | Requiere autenticación            |
| `/edit-user`       | EditUserView   | Requiere autenticación            |

---

## Pruebas

### Unitarias (Vitest)

```sh
npm run test:unit        # Modo watch
npx vitest run           # Ejecución única
npx vitest run src/path/to/file.spec.ts  # Archivo específico
```

### E2E (Cypress)

```sh
# Contra el servidor de desarrollo
npm run test:e2e:dev

# Contra el build de producción (recomendado para CI)
npm run build
npm run test:e2e
```

> Las pruebas E2E requieren que el servidor esté en el puerto 4173.

---

## Configuración del editor

**VS Code** con la extensión [Vue (Official / Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (desactivar Vetur si está instalado).

Extensiones de navegador recomendadas:

- [Vue.js devtools para Chrome](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- [Vue.js devtools para Firefox](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
