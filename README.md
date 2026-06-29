# KeyAuth Integrated Project

Este es un proyecto integrado que combina el backend de autenticación y gestión de licencias (Node.js/TypeScript) con un dashboard administrativo (React/TailwindCSS).

## Estructura del Proyecto

```
keyauth-integrated/
├── backend/             # Proyecto backend (Node.js, TypeScript, Express)
│   ├── src/             # Código fuente del backend
│   ├── dist/            # Archivos compilados del backend
│   ├── package.json
│   └── tsconfig.json
├── frontend/            # Proyecto frontend (React, TypeScript, TailwindCSS)
│   ├── public/          # Archivos estáticos públicos
│   ├── src/             # Código fuente del frontend
│   ├── dist/            # Archivos compilados del frontend
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── package.json         # Package.json raíz para pnpm workspaces
└── pnpm-workspace.yaml  # Definición de workspaces
```

## Requisitos Previos

- [Node.js](https://nodejs.org/) (v16 o superior)
- [pnpm](https://pnpm.io/) (instalado globalmente: `npm install -g pnpm`)

## Instalación y Ejecución

Sigue estos pasos para configurar y ejecutar el proyecto:

1.  **Clonar el repositorio** (si aún no lo has hecho):
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd keyauth-integrated
    ```

2.  **Instalar dependencias** para ambos proyectos (backend y frontend):
    ```bash
    pnpm install-all
    ```
    O, si ya estás en el directorio `keyauth-integrated`:
    ```bash
    pnpm install
    ```

3.  **Ejecutar en modo desarrollo** (inicia el backend y el frontend con hot-reloading):
    ```bash
    pnpm dev
    ```
    - El backend se ejecutará en `http://localhost:3001`.
    - El frontend se ejecutará en `http://localhost:3000`.
    - Las llamadas a `/api` desde el frontend serán automáticamente proxy-eadas al backend.

4.  **Construir para producción**:
    ```bash
    pnpm build
    ```
    Esto compilará tanto el backend como el frontend.

5.  **Ejecutar en modo producción**:
    ```bash
    pnpm start
    ```
    En modo producción, el backend servirá los archivos estáticos del frontend desde `http://localhost:3001`.

## Credenciales de Prueba (Backend)

El backend inicializa una aplicación de prueba automáticamente:

-   **appName**: `MyTestApp`
-   **ownerId**: `testowner`
-   **secret**: `testsecret`
-   **appVersion**: `1.0.0`

Estas credenciales se utilizan en el frontend para las llamadas a la API de vendedor.

## Endpoints de la API (Backend)

El backend expone los siguientes endpoints:

### Panel Administrativo (Seller API)

Requiere Headers: `x-owner-id` y `x-secret`.

-   `POST /api/v1/seller/licenses/generate`: Genera licencias en lote.
-   `GET /api/v1/seller/licenses`: Lista todas las licencias de la app.
-   `GET /api/v1/seller/users`: Lista todos los usuarios registrados.

### API de Integración (Client API)

Requiere Body con `appName`, `ownerId`, y `appVersion`.

-   `POST /api/v1/client/init`: Handshake inicial de la aplicación.
-   `POST /api/v1/client/register`: Registro de nuevo usuario mediante licencia.
-   `POST /api/v1/client/login`: Autenticación con chequeo estricto de HWID Lock.

## Dashboard (Frontend)

El dashboard ofrece las siguientes secciones:

-   **Dashboard**: Vista general con estadísticas y gráficos.
-   **Licencias**: Gestión de licencias, generación y visualización.
-   **Usuarios**: Monitoreo y administración de usuarios.
-   **Aplicaciones**: Gestión de aplicaciones registradas.

## Desarrollo

Para el desarrollo, puedes trabajar en los directorios `backend/` y `frontend/` de forma independiente o utilizando los scripts `pnpm dev` del workspace raíz para una experiencia integrada.
