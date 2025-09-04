import LoggingSystem from '../../utilities/loggingSystem.js';

export default {
  name: 'guildBanRemove',
  async execute(ban) {
    const logger = new LoggingSystem(ban.client);
    await logger.logUnban(ban.guild, ban.user);
  }
};
