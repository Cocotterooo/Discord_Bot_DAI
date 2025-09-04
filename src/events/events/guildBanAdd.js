import LoggingSystem from '../../utilities/loggingSystem.js';

export default {
  name: 'guildBanAdd',
  async execute(ban) {
    const logger = new LoggingSystem(ban.client);
    await logger.logBan(ban.guild, ban.user, ban.reason);
  }
};
