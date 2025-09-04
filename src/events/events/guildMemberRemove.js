import LoggingSystem from '../../utilities/loggingSystem.js';

export default {
  name: 'guildMemberRemove',
  async execute(member) {
    const logger = new LoggingSystem(member.client);
    await logger.logMemberLeave(member);
  }
};
