import LoggingSystem from '../../utilities/loggingSystem.js';

export default {
  name: 'channelDelete',
  async execute(channel) {
    // Solo logear canales del servidor
    if (!channel.guild) return;

    const logger = new LoggingSystem(channel.client);
    await logger.logChannelDelete(channel);
  }
};
