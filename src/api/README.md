# API REST - Discord Bot DAI

Esta API proporciona endpoints para obtener información sobre el servidor de Discord de la Delegación de Alumnos de Industriales.

## Configuración

La API se ejecuta por defecto en el puerto 3000. Puedes cambiar esto configurando la variable de entorno `API_PORT`.

```bash
export API_PORT=8080
```

## Endpoints Disponibles

### 1. Health Check
**GET** `/health`

Endpoint para verificar el estado del servidor API y del bot de Discord.

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-04T11:50:00.000Z",
  "botStatus": "connected"
}
```

### 2. Información Total de Usuarios
**GET** `/totalUsers`

Obtiene información detallada sobre los usuarios del servidor de Discord.

**Respuesta:**
```json
{
  "serverName": "EEI - UVigo",
  "totalMembers": 1250,
  "realUsers": 1200,
  "bots": 50,
  "userStatus": {
    "online": 45,
    "dnd": 12,
    "idle": 23,
    "offline": 1120
  },
  "timestamp": "2025-09-04T11:50:00.000Z"
}
```

**Descripción de campos:**
- `serverName`: Nombre del servidor de Discord
- `totalMembers`: Número total de miembros (incluyendo bots)
- `realUsers`: Número de usuarios reales (sin bots)
- `bots`: Número de bots en el servidor
- `userStatus`: Estado de presencia de los usuarios
  - `online`: Usuarios en línea
  - `dnd`: Usuarios en "No molestar"
  - `idle`: Usuarios ausentes/inactivos
  - `offline`: Usuarios desconectados

### 3. Información del Servidor
**GET** `/serverInfo`

Obtiene información básica sobre el servidor de Discord.

**Respuesta:**
```json
{
  "name": "EEI - UVigo",
  "id": "123456789012345678",
  "memberCount": 1250,
  "createdAt": "2020-01-01T00:00:00.000Z",
  "description": "Servidor oficial de la Escuela de Industriales",
  "iconURL": "https://cdn.discordapp.com/icons/...",
  "bannerURL": "https://cdn.discordapp.com/banners/...",
  "timestamp": "2025-09-04T11:50:00.000Z"
}
```

## Códigos de Estado

- `200`: Éxito
- `404`: Recurso no encontrado (ej: servidor de Discord no disponible)
- `500`: Error interno del servidor

## Ejemplo de Uso

```bash
# Verificar estado del API
curl http://localhost:3000/health

# Obtener información de usuarios
curl http://localhost:3000/totalUsers

# Obtener información del servidor
curl http://localhost:3000/serverInfo
```

## CORS

La API tiene CORS habilitado para permitir peticiones desde cualquier origen. En producción, es recomendable configurar los orígenes permitidos.

## Limitaciones

- La API solo funciona cuando el bot de Discord está conectado
- Los datos se obtienen en tiempo real del servidor de Discord
- La información de presencia depende de la configuración de privacidad de cada usuario
