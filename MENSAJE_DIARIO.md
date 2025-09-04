# Mensaje Diario Automático - Discord Bot DAI

## 📅 Descripción

El bot enviará automáticamente un mensaje al canal de logs todos los días a las **00:00** con la fecha actual en formato `día/mes/año` y información adicional del servidor.

## ⏰ Funcionamiento

### Horario
- **Hora**: 00:00 (medianoche)
- **Frecuencia**: Diario
- **Zona horaria**: Hora local del servidor donde se ejecuta el bot

### Formato del Mensaje
El mensaje incluye:
- **� Contenido del mensaje**: Fecha en formato DD/MM/YYYY y descripción extendida (ej: **04/09/2025** - Miércoles, 4 de Septiembre de 2025)
- **📅 Día de la semana**: En español (Lunes, Martes, etc.)
- **🗓️ Mes**: En español (Enero, Febrero, etc.)
- **🕛 Hora**: 00:00
- **👥 Miembros totales**: Contador actual del servidor
- **🎯 Estado**: Confirmación de que el bot está activo

## 🎯 Ejemplo de Mensaje

```
📅 **04/09/2025** - Miércoles, 4 de Septiembre de 2025

📅 Nuevo Día
¡Comenzamos un nuevo día en el servidor de la DAI!

 Día: Miércoles
🗓️ Mes: Septiembre
🕛 Hora: 00:00
👥 Miembros totales: 1,234
🎯 Estado: Activo y funcionando
```

### 🔍 Facilidad de Búsqueda
- **Fecha visible**: La fecha aparece en el contenido del mensaje (fuera del embed)
- **Formato búsqueda**: Puedes buscar `04/09/2025` en Discord y encontrar el mensaje
- **Información completa**: También incluye el día y fecha extendida para mayor claridad

## 🛠️ Comandos de Administración

### Probar Mensaje Diario
```
/configurar-logs test-diario
```
Envía inmediatamente un mensaje de prueba con el formato diario.

### Ver Configuración
```
/configurar-logs info
```
Muestra toda la configuración del sistema de logs, incluyendo el mensaje diario.

## ⚙️ Configuración Técnica

### Programación Automática
El sistema calcula automáticamente el tiempo restante hasta las próximas 00:00 y programa el primer mensaje. Luego se repite cada 24 horas.

### Persistencia
El mensaje diario se mantiene activo mientras el bot esté encendido. Si el bot se reinicia, automáticamente recalcula el tiempo hasta las próximas 00:00.

### Logs de Consola
El bot registra en la consola cuando envía el mensaje diario:
```
📅 Mensaje diario enviado: 04/09/2025
⏰ Mensaje diario programado para las 00:00 (en 123 minutos)
```

## 🔧 Personalización

### Cambiar Contenido
Para modificar el contenido del mensaje, edita el método `logDailyMessage()` en:
```
src/utilities/loggingSystem.js
```

### Cambiar Horario
Para cambiar la hora del mensaje, modifica la función `setupDailyMessage()` en:
```
src/events/events/ready.js
```

## ⚠️ Consideraciones

- **Dependencia del canal de logs**: El mensaje solo se enviará si el canal de logs está configurado
- **Zona horaria**: El mensaje se envía según la hora local del servidor
- **Reinicio del bot**: Si el bot se reinicia, el programador se reinicia automáticamente
- **Errores de envío**: Si hay errores, se registran en la consola pero no interrumpen el funcionamiento

## 📊 Beneficios

1. **Monitoreo diario**: Confirma que el bot está activo cada día
2. **Seguimiento de crecimiento**: Muestra el número de miembros diariamente
3. **Organización temporal**: Ayuda a organizar los logs por días
4. **Detección de problemas**: Si no aparece el mensaje, indica un posible problema con el bot

---

**Implementado para la Delegación de Alumnos de Industriales - Universidad de Vigo**
