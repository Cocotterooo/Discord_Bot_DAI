import LoggingSystem from '../../utilities/loggingSystem.js';

export default {
  name: 'guildMemberUpdate',
  async execute(oldMember, newMember) {
    const logger = new LoggingSystem(newMember.client);

    // Log cambios de roles
    await logger.logRoleUpdate(oldMember, newMember);

    // Log cambios de timeout
    if (!oldMember.communicationDisabledUntil && newMember.communicationDisabledUntil) {
      const duration = new Date(newMember.communicationDisabledUntil) - new Date();
      const durationString = `${Math.ceil(duration / (1000 * 60))} minutos`;
      await logger.logTimeout(newMember, durationString);
    } else if (oldMember.communicationDisabledUntil && !newMember.communicationDisabledUntil) {
      await logger.logTimeoutEnd(newMember);
    }
  }
};
