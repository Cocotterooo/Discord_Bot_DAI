import LoggingSystem from '../../utilities/loggingSystem.js';

export default {
  name: 'messageDelete',
  async execute(message) {
    // No logear mensajes de bots o mensajes en DM
    if (!message.guild || !message.author || message.author.bot) return;

    const logger = new LoggingSystem(message.client);
    await logger.logMessageDelete(message);
  }
};
