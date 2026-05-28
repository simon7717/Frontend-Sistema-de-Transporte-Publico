# Frontend-Sistema-de-Transporte-Público

Sistema de administración de transporte público desarrollado en Angular (standalone), Angular Material y consumo de API REST FastAPI.

## Descripción del Proyecto

Aplicación web para gestionar entidades de transporte público con interfaz administrativa, autenticación por usuario, trazabilidad de auditoría en entidades clave y módulos CRUD completos.

## Módulos

| Módulo | Descripción | Auditoría |
|---|---|---|
| Login | Inicio de sesión y creación del primer usuario | — |
| Usuarios | Administración de usuarios | — |
| Tarjetas | Administración de tarjetas de transporte | ✅ |
| Rutas | Administración de rutas | ✅ |
| Viajes | Administración de viajes | ✅ |
| Vehiculos | Administración de vehículos | — |
| Estaciones | Administración de estaciones | — |

## Requisitos Técnicos

- Node.js 20+
- npm 10+
- Angular CLI 21
- Backend FastAPI ejecutándose en `http://localhost:8000`

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/simon7717/Frontend-Sistema-de-Transporte-Publico.git
cd Frontend-Sistema-de-Transporte-Publico
```

2. Entrar al proyecto web e instalar dependencias:
```bash
cd web
npm install
```

## Ejecución

Para levantar el frontend, desde `web/`:

```bash
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

## Integración con Backend

- En desarrollo se usa proxy (`web/proxy.conf.json`) para redirigir `/api` a `http://localhost:8000`.
- Configuración de entorno:
  - `web/src/environments/environment.ts` -> `apiUrl: '/api'`
  - `web/src/environments/environment.prod.ts` -> `apiUrl: ''`

## Scripts útiles

Desde `web/`:

- `npm start` -> servidor de desarrollo
- `npm run build` -> compilación
- `npm run watch` -> compilación en modo watch
- `npm test` -> pruebas unitarias

## Flujo Git

1. Rama `feat/*` se crea desde `dev`
2. Pull Request: `feat` -> `dev`
3. Pull Request: `feat` -> `qa`
4. Pull Request: `feat` -> `prod`

## Autores

- Samuel (@chimuelo1014)
- Simon Avila (@simon7717)

## Video demostrativo

🎥 URL del video:
https://vimeo.com/1189588389?fl=ip&fe=ec

## Video demostrativo (URL Online)
🎥 URL del video:
https://vimeo.com/1196394351?share=copy&fl=sv&fe=ci

URL's:
Frontend (netify): https://monumental-shortbread-3e724a.netlify.app/app/usuarios
Backend (render) : https://backend-sistema-de-transporte-p-blico.onrender.com

## Licencia

Proyecto educativo para el curso de Programación de Software.
