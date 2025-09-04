import LoggingSystem from '../../utilities/loggingSystem.js';

export default {
  name: 'channelCreate',
  async execute(channel) {
    // Solo logear canales del servidor
    if (!channel.guild) return;

    const logger = new LoggingSystem(channel.client);
    await logger.logChannelCreate(channel);
  }
};
