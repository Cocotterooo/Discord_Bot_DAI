import LoggingSystem from '../../utilities/loggingSystem.js';

export default {
  name: 'guildMemberAdd',
  async execute(member) {
    const logger = new LoggingSystem(member.client);
    await logger.logMemberJoin(member);
  }
};
