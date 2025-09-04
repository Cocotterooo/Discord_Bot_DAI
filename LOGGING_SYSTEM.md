# Sistema de Logging - Discord Bot DAI

## 📋 Descripción

Sistema completo de logging que registra todos los eventos importantes del servidor de Discord en un canal específico. Este sistema incluye logs para moderación, entradas/salidas de miembros, actividad de canales de voz, mensajes, roles y más.

## ⚙️ Configuración

### 1. Configurar el Canal de Logs

Primero, necesitas configurar qué canal será usado para los logs:

1. Usa el comando `/configurar-logs canal #tu-canal-de-logs`
2. O edita manualmente el archivo `config.js` y cambia el valor de `LOGS_CHANNEL`:
   ```javascript
   channelIds: {
     // ... otros canales
     LOGS_CHANNEL: 'ID_DE_TU_CANAL_DE_LOGS'
   }
   ```

### 2. Comandos Disponibles

- `/configurar-logs canal` - Establece el canal de logs
- `/configurar-logs test` - Envía un mensaje de prueba al canal de logs
- `/configurar-logs info` - Muestra la configuración actual

## 📊 Eventos Registrados

### 👥 Miembros del Servidor
- **Entrada de miembros**: Cuando alguien se une al servidor
- **Salida de miembros**: Cuando alguien sale del servidor
- **Cambios de roles**: Cuando se añaden o quitan roles a los miembros
- **Timeouts**: Cuando se pone o quita un timeout a un usuario

### 🔊 Canales de Voz
- **Entrada a canal de voz**: Cuando un usuario se une a cualquier canal de voz
- **Salida de canal de voz**: Cuando un usuario sale de cualquier canal de voz
- **Cambio de canal de voz**: Cuando un usuario se mueve entre canales de voz

### 🔨 Moderación
- **Bans**: Cuando se banea a un usuario
- **Unbans**: Cuando se desbanea a un usuario
- **Kicks**: Cuando se expulsa a un usuario
- **Timeouts**: Cuando se silencia temporalmente a un usuario

### 💬 Mensajes
- **Mensajes eliminados**: Registra el contenido de mensajes eliminados
- **Mensajes editados**: Muestra el antes y después de mensajes editados

### 📍 Canales
- **Creación de canales**: Cuando se crean nuevos canales
- **Eliminación de canales**: Cuando se eliminan canales

## 🎨 Características

### Embeds Informativos
Todos los logs se envían como embeds con:
- **Colores distintivos** para cada tipo de evento
- **Timestamps** automáticos
- **Información detallada** del usuario y la acción
- **Thumbnails** con avatares de usuarios
- **Footer** con la marca de la DAI

### Filtros Inteligentes
- **No registra bots**: Excluye automáticamente las acciones de bots
- **Evita spam**: No registra ediciones menores o cambios sin contenido
- **Solo eventos del servidor**: No registra mensajes directos

## 🛠️ Archivos del Sistema

### Archivos Principales
- `src/utilities/loggingSystem.js` - Sistema principal de logging
- `src/events/slashCommands/admin/configurar-logs.js` - Comando de configuración

### Eventos
- `src/events/events/guildMemberAdd.js` - Entrada de miembros
- `src/events/events/guildMemberRemove.js` - Salida de miembros
- `src/events/events/guildMemberUpdate.js` - Cambios de miembros
- `src/events/events/guildBanAdd.js` - Bans
- `src/events/events/guildBanRemove.js` - Unbans
- `src/events/events/messageDelete.js` - Mensajes eliminados
- `src/events/events/messageUpdate.js` - Mensajes editados
- `src/events/events/channelCreate.js` - Creación de canales
- `src/events/events/channelDelete.js` - Eliminación de canales
- `src/events/voiceStateUpdate.js` - Actividad de canales de voz (actualizado)

## 🔧 Personalización

### Colores de Embeds
Puedes personalizar los colores en `loggingSystem.js`:
- Verde (`0x00ff00`) - Eventos positivos (unirse, crear)
- Rojo (`0xff0000`) - Eventos negativos (salir, eliminar, ban)
- Naranja (`0xff6b00`) - Eventos de moderación (kick, timeout)
- Amarillo (`0xffff00`) - Eventos de cambio (editar, mover)

### Añadir Nuevos Eventos
1. Crea un nuevo método en la clase `LoggingSystem`
2. Crea un nuevo archivo de evento en `src/events/events/`
3. Importa y usa el sistema de logging en el evento

## 📝 Ejemplo de Uso

```javascript
// En cualquier evento o comando
import LoggingSystem from '../utilities/loggingSystem.js';

const logger = new LoggingSystem(client);
await logger.logMemberJoin(member);
```

## ⚠️ Notas Importantes

1. **Permisos**: El bot necesita permisos para enviar mensajes en el canal de logs
2. **Rate Limits**: El sistema respeta los límites de Discord automáticamente
3. **Configuración**: Recuerda actualizar el `config.js` con el ID real del canal
4. **Privacidad**: Los logs pueden contener información sensible, asegúrate de que el canal esté restringido

## 🚀 Instalación

El sistema se activa automáticamente al reiniciar el bot. Solo necesitas:

1. Configurar el canal de logs con `/configurar-logs canal`
2. Probar con `/configurar-logs test`
3. ¡Listo! Todos los eventos se registrarán automáticamente

---

**Desarrollado para la Delegación de Alumnos de Industriales - Universidad de Vigo**
