# Hammock - Multi-App Mock Server

Servidor mock extensible para simular múltiples APIs. 

## Arquitectura

### Estructura de Capas

```
src/
├── core/              # Core del servidor (capa de infraestructura)
│   ├── Server.ts      # MockServer - Orquesta apps y maneja middleware
│   └── IAppMock.ts    # Interface para apps mock (extensibilidad)
├── apps/              # Implementaciones de apps mock (capa de dominio)
│   └── home-assistant/
│       ├── HAHandler.ts   # HomeAssistantMock - Implementación HA
│       └── states.json    # Estados iniciales de entidades
└── types.ts           # DTOs y contratos de datos
```


## Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y personaliza las configuraciones:

```bash
# Servidor
SERVER_PORT=3000
LOG_LEVEL=info

# Home Assistant
HOME_ASSISTANT_LOCATION_NAME=Mock Home
HOME_ASSISTANT_LATITUDE=40.4168
HOME_ASSISTANT_LONGITUDE=-3.7038
HOME_ASSISTANT_ELEVATION=667
HOME_ASSISTANT_TIMEZONE=Europe/Madrid
HOME_ASSISTANT_VERSION=2026.2.1

# Sistema de Unidades
HOME_ASSISTANT_UNIT_SYSTEM_LENGTH=m
HOME_ASSISTANT_UNIT_SYSTEM_MASS=kg
HOME_ASSISTANT_UNIT_SYSTEM_TEMPERATURE=°C
HOME_ASSISTANT_UNIT_SYSTEM_VOLUME=L

# Componentes Habilitados
HOME_ASSISTANT_COMPONENTS=light,switch,sensor,binary_sensor,automation
```

## Uso

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev    # Modo watch con tsx
```

### Producción

```bash
npm run build  # Compilar TypeScript
npm start      # Ejecutar desde dist/
```

## Endpoints Implementados

### Home Assistant Mock

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/config` | Configuración del sistema |
| GET | `/api/states` | Lista todas las entidades |
| GET | `/api/states/:entity_id` | Obtiene entidad específica |
| POST | `/api/services/:domain/:service` | Ejecuta servicio (turn_on, turn_off) |
| GET | `/api/events` | SSE connection |



## Extensibilidad

### Añadir Nueva App Mock

1. Implementa la interfaz `IAppMock`:

```typescript
import { Hono } from 'hono';
import type { IAppMock } from '../../core/IAppMock.js';

export class SpotifyMock implements IAppMock {
  name = 'spotify';
  version = '1.0.0';
  basePath = '/spotify';

  registerRoutes(server: Hono): void {
    const app = new Hono();
    app.get(`${this.basePath}/me`, (c) => c.json({ id: '123' }));
    server.route('/', app);
  }
}
```

2. Regístrala en `src/index.ts`:

```typescript
import 'dotenv/config';
import { MockServer } from './core/Server.js';
import { HomeAssistantMock } from './apps/home-assistant/HAHandler.js';
import { SpotifyMock } from './apps/spotify/SpotifyHandler.js';

const server = new MockServer();

server.registerApp(new HomeAssistantMock());
server.registerApp(new SpotifyMock());

await server.start();
```

## Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| TypeScript | 5.9.3 | Lenguaje principal |
| Hono | 4.11.8 | Framework web ligero |
| Zod | 3.x | Validación de esquemas |
| @hono/node-server | 1.19.9 | Server HTTP |
| dotenv | latest | Variables de entorno |
| tsx | 4.21.0 | Ejecución TypeScript |

## Alcance del Desarrollo

### Funcionalidades Actuales

- ✅ MockServer extensible con registro dinámico de apps
- ✅ Home Assistant Mock (versión 2026.2.1)
- ✅ Endpoints CRUD para entidades HA
- ✅ Ejecución de servicios (light, switch)
- ✅ Estado persistente en memoria
- ✅ Configuración vía variables de entorno
- ✅ Middleware de logging y CORS
- ✅ Validación de requests con Zod

