import LoggingSystem from '../../utilities/loggingSystem.js';

export default {
  name: 'messageUpdate',
  async execute(oldMessage, newMessage) {
    // No logear mensajes de bots o mensajes en DM
    if (!newMessage.guild || !newMessage.author || newMessage.author.bot) return;

    const logger = new LoggingSystem(newMessage.client);
    await logger.logMessageEdit(oldMessage, newMessage);
  }
};
