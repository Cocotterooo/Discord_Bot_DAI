import LoggingSystem from '../../utilities/loggingSystem.js';

export default {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ ${client.user.tag} está conectado y listo!`.green);
    console.log(`👥 Usuarios: ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)}`.cyan);
    console.log('🔧 Sistema de logging activado'.yellow);

    // Log de inicio del bot
    const logger = new LoggingSystem(client);
    const embed = logger.createBaseEmbed('🤖 Bot Iniciado', 0x00ff00)
      .setDescription('El bot Discord DAI se ha iniciado correctamente')
      .addFields([
        { name: '🔧 Versión', value: 'Sistema de Logging', inline: true },
        { name: '👥 Usuarios', value: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toString(), inline: true }
      ]);

    // Intentar enviar log de inicio (si el canal está configurado)
    try {
      await logger.sendLog(embed);
    } catch (error) {
      console.log('Canal de logs no configurado aún. Usa /configurar-logs canal para establecerlo.'.yellow);
    }

    // Configurar mensaje diario a las 00:00
    setupDailyMessage(client);
  }
};

/**
 * Configura el mensaje diario que se envía a las 00:00
 */
function setupDailyMessage(client) {
  // Función para enviar el mensaje diario
  const sendDailyMessage = async () => {
    const logger = new LoggingSystem(client);

    try {
      await logger.logDailyMessage();
      const now = new Date();
      const dateString = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
      console.log(`📅 Mensaje diario enviado: ${dateString}`.cyan);
    } catch (error) {
      console.log('Error al enviar mensaje diario:', error);
    }
  };

  // Calcular tiempo hasta las próximas 00:00
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const timeUntilMidnight = tomorrow.getTime() - now.getTime();

  // Programar el primer mensaje
  setTimeout(() => {
    sendDailyMessage();

    // Luego programar para que se repita cada 24 horas
    setInterval(sendDailyMessage, 24 * 60 * 60 * 1000);
  }, timeUntilMidnight);

  console.log(`⏰ Mensaje diario programado para las 00:00 (en ${Math.round(timeUntilMidnight / 1000 / 60)} minutos)`.yellow);
}
