import { EmbedBuilder, time, TimestampStyles, ChannelType } from 'discord.js';
import { discordConfig } from '../../config.js';

/**
 * Sistema de logging centralizado para Discord Bot DAI
 */
class LoggingSystem {
  constructor(client) {
    this.client = client;
    this.logsChannelId = discordConfig.channelIds.LOGS_CHANNEL;
  }

  /**
   * Obtiene el canal de logs
   */
  async getLogsChannel() {
    try {
      const channel = await this.client.channels.fetch(this.logsChannelId);
      return channel;
    } catch (error) {
      console.error('Error al obtener el canal de logs:', error);
      return null;
    }
  }

  /**
   * Envía un embed de log al canal
   */
  async sendLog(embed, content = null) {
    const logsChannel = await this.getLogsChannel();
    if (!logsChannel) return;

    try {
      const messageOptions = { embeds: [embed] };
      if (content) {
        messageOptions.content = content;
      }
      await logsChannel.send(messageOptions);
    } catch (error) {
      console.error('Error al enviar log:', error);
    }
  }

  /**
   * Crea un embed base para logs
   */
  createBaseEmbed(title, color = discordConfig.COLOR) {
    return new EmbedBuilder()
      .setTitle(title)
      .setColor(color)
      .setTimestamp()
      .setFooter({
        text: discordConfig.defaultEmbed.DAI_SIGN,
        iconURL: discordConfig.defaultEmbed.FOOTER_SEPARATOR
      });
  }

  // MARK: LOGS DE MIEMBROS
  /**
   * Log cuando un miembro se une al servidor
   */
  async logMemberJoin(member) {
    const embed = this.createBaseEmbed('🟢 Miembro Unido', 0x00ff00)
      .setDescription(`**${member.user.tag}** se ha unido al servidor`)
      .addFields([
        { name: '👤 Usuario', value: `<@${member.user.id}> (${member.user.id})`, inline: true },
        { name: '📅 Cuenta creada', value: time(member.user.createdAt, TimestampStyles.RelativeTime), inline: true },
        { name: '📊 Miembros totales', value: member.guild.memberCount.toString(), inline: true }
      ])
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

    await this.sendLog(embed);
  }

  /**
   * Log cuando un miembro sale del servidor
   */
  async logMemberLeave(member) {
    const embed = this.createBaseEmbed('🔴 Miembro Salió', 0xff0000)
      .setDescription(`**${member.user.tag}** ha salido del servidor`)
      .addFields([
        { name: '👤 Usuario', value: `${member.user.tag} (${member.user.id})`, inline: true },
        { name: '📅 Se unió', value: member.joinedAt ? time(member.joinedAt, TimestampStyles.RelativeTime) : 'Desconocido', inline: true },
        { name: '📊 Miembros totales', value: member.guild.memberCount.toString(), inline: true }
      ])
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

    await this.sendLog(embed);
  }

  // MARK: LOGS DE CANALES DE VOZ
  /**
   * Log cuando un usuario se une a un canal de voz
   */
  async logVoiceChannelJoin(member, channel) {
    const embed = this.createBaseEmbed('🔊 Unión a Canal de Voz', 0x00ff00)
      .setDescription(`**${member.user.tag}** se unió al canal de voz`)
      .addFields([
        { name: '👤 Usuario', value: `<@${member.user.id}>`, inline: true },
        { name: '🔊 Canal', value: `${channel.name}`, inline: true },
        { name: '👥 Miembros en canal', value: channel.members.size.toString(), inline: true }
      ])
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

    await this.sendLog(embed);
  }

  /**
   * Log cuando un usuario sale de un canal de voz
   */
  async logVoiceChannelLeave(member, channel) {
    const embed = this.createBaseEmbed('🔇 Salida de Canal de Voz', 0xff6b00)
      .setDescription(`**${member.user.tag}** salió del canal de voz`)
      .addFields([
        { name: '👤 Usuario', value: `<@${member.user.id}>`, inline: true },
        { name: '🔊 Canal', value: `${channel.name}`, inline: true },
        { name: '👥 Miembros en canal', value: channel.members.size.toString(), inline: true }
      ])
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

    await this.sendLog(embed);
  }

  /**
   * Log cuando un usuario cambia de canal de voz
   */
  async logVoiceChannelMove(member, oldChannel, newChannel) {
    const embed = this.createBaseEmbed('🔀 Cambio de Canal de Voz', 0xffff00)
      .setDescription(`**${member.user.tag}** se movió entre canales de voz`)
      .addFields([
        { name: '👤 Usuario', value: `<@${member.user.id}>`, inline: false },
        { name: '🔊 Canal anterior', value: `${oldChannel.name}`, inline: true },
        { name: '🔊 Canal nuevo', value: `${newChannel.name}`, inline: true }
      ])
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

    await this.sendLog(embed);
  }

  // MARK: LOGS DE MODERACIÓN
  /**
   * Log de ban
   */
  async logBan(guild, user, reason = 'No especificada') {
    // Obtener información del autor desde audit logs
    let author = null;
    try {
      const auditLogs = await guild.fetchAuditLogs({
        type: 22, // MEMBER_BAN_ADD
        limit: 1
      });
      const auditEntry = auditLogs.entries.first();
      if (auditEntry && auditEntry.target.id === user.id) {
        author = auditEntry.executor;
      }
    } catch (error) {
      console.error('Error al obtener audit logs para ban:', error);
    }

    const embed = this.createBaseEmbed('🔨 Usuario Baneado', 0xff0000)
      .setDescription(`**${user.tag}** ha sido baneado del servidor`)
      .addFields([
        { name: '👤 Usuario', value: `${user.tag} (${user.id})`, inline: true },
        { name: '📝 Razón', value: reason, inline: false }
      ])
      .setThumbnail(user.displayAvatarURL({ dynamic: true }));

    if (author) {
      embed.addFields([
        { name: '🔨 Baneado por', value: `<@${author.id}> (${author.tag})`, inline: false }
      ]);
    }

    await this.sendLog(embed);
  }

  /**
   * Log de unban
   */
  async logUnban(guild, user) {
    // Obtener información del autor desde audit logs
    let author = null;
    try {
      const auditLogs = await guild.fetchAuditLogs({
        type: 23, // MEMBER_BAN_REMOVE
        limit: 1
      });
      const auditEntry = auditLogs.entries.first();
      if (auditEntry && auditEntry.target.id === user.id) {
        author = auditEntry.executor;
      }
    } catch (error) {
      console.error('Error al obtener audit logs para unban:', error);
    }

    const embed = this.createBaseEmbed('✅ Usuario Desbaneado', 0x00ff00)
      .setDescription(`**${user.tag}** ha sido desbaneado del servidor`)
      .addFields([
        { name: '👤 Usuario', value: `${user.tag} (${user.id})`, inline: true }
      ])
      .setThumbnail(user.displayAvatarURL({ dynamic: true }));

    if (author) {
      embed.addFields([
        { name: '✅ Desbaneado por', value: `<@${author.id}> (${author.tag})`, inline: false }
      ]);
    }

    await this.sendLog(embed);
  }

  /**
   * Log de kick
   */
  async logKick(member, reason = 'No especificada') {
    const embed = this.createBaseEmbed('👢 Usuario Expulsado', 0xff6b00)
      .setDescription(`**${member.user.tag}** ha sido expulsado del servidor`)
      .addFields([
        { name: '👤 Usuario', value: `${member.user.tag} (${member.user.id})`, inline: true },
        { name: '📝 Razón', value: reason, inline: false }
      ])
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

    await this.sendLog(embed);
  }

  /**
   * Log de timeout/mute
   */
  async logTimeout(member, duration, reason = 'No especificada') {
    // Obtener información del autor desde audit logs
    let author = null;
    try {
      const auditLogs = await member.guild.fetchAuditLogs({
        type: 24, // MEMBER_UPDATE
        limit: 5
      });
      const auditEntry = auditLogs.entries.find(entry =>
        entry.target.id === member.id &&
        entry.changes?.some(change => change.key === 'communication_disabled_until')
      );
      if (auditEntry) {
        author = auditEntry.executor;
      }
    } catch (error) {
      console.error('Error al obtener audit logs para timeout:', error);
    }

    const embed = this.createBaseEmbed('🔇 Usuario en Timeout', 0xff6b00)
      .setDescription(`**${member.user.tag}** ha sido puesto en timeout`)
      .addFields([
        { name: '👤 Usuario', value: `<@${member.user.id}>`, inline: true },
        { name: '⏰ Duración', value: duration, inline: true },
        { name: '📝 Razón', value: reason, inline: false }
      ])
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

    if (author) {
      embed.addFields([
        { name: '🔇 Timeout aplicado por', value: `<@${author.id}> (${author.tag})`, inline: false }
      ]);
    }

    await this.sendLog(embed);
  }

  /**
   * Log de fin de timeout
   */
  async logTimeoutEnd(member) {
    const embed = this.createBaseEmbed('🔊 Fin de Timeout', 0x00ff00)
      .setDescription(`**${member.user.tag}** ya no está en timeout`)
      .addFields([
        { name: '👤 Usuario', value: `<@${member.user.id}>`, inline: true }
      ])
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }));

    await this.sendLog(embed);
  }

  // MARK: LOGS DE MENSAJES
  /**
   * Log de mensaje eliminado
   */
  async logMessageDelete(message) {
    if (!message.author || message.author.bot) return;

    const embed = this.createBaseEmbed('🗑️ Mensaje Eliminado', 0xff0000)
      .setDescription(`Un mensaje de **${message.author.tag}** fue eliminado`)
      .addFields([
        { name: '👤 Autor', value: `<@${message.author.id}>`, inline: true },
        { name: '📍 Canal', value: `<#${message.channel.id}>`, inline: true },
        { name: '💬 Contenido', value: message.content || '*Sin contenido de texto*', inline: false }
      ])
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

    if (message.attachments.size > 0) {
      embed.addFields([
        { name: '📎 Archivos adjuntos', value: `${message.attachments.size} archivo(s)`, inline: true }
      ]);
    }

    await this.sendLog(embed);
  }

  /**
   * Log de mensaje editado
   */
  async logMessageEdit(oldMessage, newMessage) {
    if (!oldMessage.author || oldMessage.author.bot) return;
    if (oldMessage.content === newMessage.content) return;

    const embed = this.createBaseEmbed('✏️ Mensaje Editado', 0xffff00)
      .setDescription(`Un mensaje de **${oldMessage.author.tag}** fue editado`)
      .addFields([
        { name: '👤 Autor', value: `<@${oldMessage.author.id}>`, inline: true },
        { name: '📍 Canal', value: `<#${oldMessage.channel.id}>`, inline: true },
        { name: '📝 Mensaje original', value: oldMessage.content || '*Sin contenido*', inline: false },
        { name: '📝 Mensaje nuevo', value: newMessage.content || '*Sin contenido*', inline: false }
      ])
      .setThumbnail(oldMessage.author.displayAvatarURL({ dynamic: true }));

    await this.sendLog(embed);
  }

  // MARK: LOGS DE ROLES
  /**
   * Log de cambios de roles
   */
  async logRoleUpdate(oldMember, newMember) {
    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

    // Obtener información del autor desde audit logs para cambios de roles
    let author = null;
    try {
      const auditLogs = await newMember.guild.fetchAuditLogs({
        type: 25, // MEMBER_ROLE_UPDATE
        limit: 5
      });
      const auditEntry = auditLogs.entries.find(entry =>
        entry.target.id === newMember.id &&
        entry.changes?.some(change => change.key === '$add' || change.key === '$remove')
      );
      if (auditEntry) {
        author = auditEntry.executor;
      }
    } catch (error) {
      console.error('Error al obtener audit logs para cambio de roles:', error);
    }

    if (addedRoles.size > 0) {
      const embed = this.createBaseEmbed('➕ Roles Añadidos', 0x00ff00)
        .setDescription(`Se añadieron roles a **${newMember.user.tag}**`)
        .addFields([
          { name: '👤 Usuario', value: `<@${newMember.user.id}>`, inline: true },
          { name: '🏷️ Roles añadidos', value: addedRoles.map(role => `<@&${role.id}>`).join(', '), inline: false }
        ])
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }));

      if (author) {
        embed.addFields([
          { name: '👤 Modificado por', value: `<@${author.id}> (${author.tag})`, inline: false }
        ]);
      }

      await this.sendLog(embed);
    }

    if (removedRoles.size > 0) {
      const embed = this.createBaseEmbed('➖ Roles Eliminados', 0xff6b00)
        .setDescription(`Se eliminaron roles de **${newMember.user.tag}**`)
        .addFields([
          { name: '👤 Usuario', value: `<@${newMember.user.id}>`, inline: true },
          { name: '🏷️ Roles eliminados', value: removedRoles.map(role => `@${role.name}`).join(', '), inline: false }
        ])
        .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }));

      if (author) {
        embed.addFields([
          { name: '👤 Modificado por', value: `<@${author.id}> (${author.tag})`, inline: false }
        ]);
      }

      await this.sendLog(embed);
    }
  }

  // MARK: LOGS DE CANALES
  /**
   * Log de creación de canal
   */
  async logChannelCreate(channel) {
    // Ignorar canales de voz en la categoría específica
    if (channel.type === ChannelType.GuildVoice && channel.parentId === '1292969422868320397') {
      return;
    }

    const channelTypes = {
      [ChannelType.GuildText]: '💬 Texto',
      [ChannelType.GuildVoice]: '🔊 Voz',
      [ChannelType.GuildCategory]: '📁 Categoría',
      [ChannelType.GuildStageVoice]: '🎭 Escenario'
    };

    // Obtener información del autor desde audit logs
    let author = null;
    try {
      const auditLogs = await channel.guild.fetchAuditLogs({
        type: 10, // CHANNEL_CREATE
        limit: 1
      });
      const auditEntry = auditLogs.entries.first();
      if (auditEntry && auditEntry.target.id === channel.id) {
        author = auditEntry.executor;
      }
    } catch (error) {
      console.error('Error al obtener audit logs para creación de canal:', error);
    }

    const embed = this.createBaseEmbed('➕ Canal Creado', 0x00ff00)
      .setDescription('Se creó un nuevo canal')
      .addFields([
        { name: '📍 Canal', value: `${channel.name}`, inline: true },
        { name: '📋 Tipo', value: channelTypes[channel.type] || 'Desconocido', inline: true },
        { name: '🆔 ID', value: channel.id, inline: true }
      ]);

    if (author) {
      embed.addFields([
        { name: '👤 Creado por', value: `<@${author.id}> (${author.tag})`, inline: false }
      ]);
    }

    await this.sendLog(embed);
  }

  /**
   * Log de eliminación de canal
   */
  async logChannelDelete(channel) {
    // Ignorar canales de voz en la categoría específica
    if (channel.type === ChannelType.GuildVoice && channel.parentId === '1292969422868320397') {
      return;
    }

    const channelTypes = {
      [ChannelType.GuildText]: '💬 Texto',
      [ChannelType.GuildVoice]: '🔊 Voz',
      [ChannelType.GuildCategory]: '📁 Categoría',
      [ChannelType.GuildStageVoice]: '🎭 Escenario'
    };

    // Obtener información del autor desde audit logs
    let author = null;
    try {
      const auditLogs = await channel.guild.fetchAuditLogs({
        type: 12, // CHANNEL_DELETE
        limit: 1
      });
      const auditEntry = auditLogs.entries.first();
      if (auditEntry && auditEntry.target.id === channel.id) {
        author = auditEntry.executor;
      }
    } catch (error) {
      console.error('Error al obtener audit logs para eliminación de canal:', error);
    }

    const embed = this.createBaseEmbed('🗑️ Canal Eliminado', 0xff0000)
      .setDescription('Se eliminó un canal')
      .addFields([
        { name: '📍 Canal', value: `${channel.name}`, inline: true },
        { name: '📋 Tipo', value: channelTypes[channel.type] || 'Desconocido', inline: true },
        { name: '🆔 ID', value: channel.id, inline: true }
      ]);

    if (author) {
      embed.addFields([
        { name: '👤 Eliminado por', value: `<@${author.id}> (${author.tag})`, inline: false }
      ]);
    }

    await this.sendLog(embed);
  }

  // MARK: LOGS ESPECIALES
  /**
   * Log de mensaje diario
   */
  async logDailyMessage() {
    const now = new Date();
    const dateString = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    // Obtener día de la semana en español
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = daysOfWeek[now.getDay()];

    // Obtener mes en español
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthName = months[now.getMonth()];

    // Contenido del mensaje con la fecha para facilitar búsquedas
    const messageContent = `📅 **${dateString}** - ${dayName}, ${now.getDate()} de ${monthName} de ${now.getFullYear()}`;

    const embed = this.createBaseEmbed('📅 Nuevo Día', 0x0099ff)
      .setDescription('¡Comenzamos un nuevo día en el servidor de la DAI!')
      .addFields([
        { name: '📅 Día', value: dayName, inline: true },
        { name: '🗓️ Mes', value: monthName, inline: true },
        { name: '🕛 Hora', value: '00:00', inline: true },
        { name: '👥 Miembros totales', value: this.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toString(), inline: true },
        { name: '🎯 Estado', value: 'Activo y funcionando', inline: true }
      ]);

    await this.sendLog(embed, messageContent);
  }
}

export default LoggingSystem;
