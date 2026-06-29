# KeyAuth Clone Backend - TypeScript

Este proyecto es un backend funcional que replica las capacidades de gestión de licencias y autenticación de KeyAuth. Está construido con **Node.js**, **Express**, y **TypeScript**, utilizando **pnpm** como gestor de paquetes.

## Estructura del Proyecto

El proyecto sigue una arquitectura modular y limpia:

- `src/controllers/`: Lógica de los endpoints para vendedores y clientes.
- `src/middlewares/`: Validación de aplicaciones y autenticación de vendedores.
- `src/models/`: Definiciones de interfaces de TypeScript para las entidades.
- `src/routes/`: Definición de las rutas de la API.
- `src/utils/`: Funciones de utilidad y la base de datos en memoria (`mockDb`).
- `src/server.ts`: Punto de entrada de la aplicación.

## Requisitos Previos

- Node.js (v16 o superior)
- pnpm instalado globalmente (`npm install -g pnpm`)

## Instalación y Ejecución

1. Instala las dependencias:
   ```bash
   pnpm install
   ```

2. Inicia el servidor en modo desarrollo:
   ```bash
   pnpm dev
   ```

3. Compila para producción:
   ```bash
   pnpm build
   ```

4. Ejecuta el código compilado:
   ```bash
   pnpm start
   ```

## Endpoints Principales

### Panel Administrativo (Seller API)
Requiere Headers: `x-owner-id` y `x-secret`.

- `POST /api/v1/seller/licenses/generate`: Genera licencias en lote.
- `GET /api/v1/seller/licenses`: Lista todas las licencias de la app.
- `GET /api/v1/seller/users`: Lista todos los usuarios registrados.

### API de Integración (Client API)
Requiere Body con `appName`, `ownerId`, y `appVersion`.

- `POST /api/v1/client/init`: Handshake inicial de la aplicación.
- `POST /api/v1/client/register`: Registro de nuevo usuario mediante licencia.
- `POST /api/v1/client/login`: Autenticación con chequeo estricto de HWID Lock.

## Datos de Prueba Iniciales

Al iniciar el servidor, se crea automáticamente una aplicación de prueba:
- **appName**: `MyTestApp`
- **ownerId**: `testowner`
- **secret**: `testsecret`
- **appVersion**: `1.0.0`
