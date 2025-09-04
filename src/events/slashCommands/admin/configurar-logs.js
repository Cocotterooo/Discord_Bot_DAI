import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType
} from 'discord.js';
import { discordConfig } from '../../../../config.js';
import LoggingSystem from '../../../utilities/loggingSystem.js';

export default {
  data: new SlashCommandBuilder()
    .setName('configurar-logs')
    .setDescription('Configura el sistema de logging del servidor')
    .addSubcommand(subcommand =>
      subcommand
        .setName('canal')
        .setDescription('Establece el canal de logs')
        .addChannelOption(option =>
          option
            .setName('canal')
            .setDescription('Canal donde se enviarán los logs')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('test')
        .setDescription('Envía un mensaje de prueba al canal de logs')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('test-diario')
        .setDescription('Envía un mensaje de prueba del mensaje diario')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('info')
        .setDescription('Muestra la configuración actual de logs')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),

  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'canal': {
        const channel = interaction.options.getChannel('canal');

        // Actualizar el ID del canal en el config (nota: esto es temporal para esta sesión)
        discordConfig.channelIds.LOGS_CHANNEL = channel.id;

        const successEmbed = new EmbedBuilder()
          .setTitle('✅ Canal de Logs Configurado')
          .setDescription(`El canal de logs ha sido establecido como ${channel}`)
          .addFields([
            { name: '📍 Canal', value: `${channel.name} (${channel.id})`, inline: true },
            { name: '📝 Nota', value: 'Recuerda actualizar el archivo config.js con el nuevo ID', inline: false }
          ])
          .setColor(0x00ff00)
          .setTimestamp();

        await interaction.reply({ embeds: [successEmbed], ephemeral: true });
        break;
      }

      case 'test': {
        const logger = new LoggingSystem(client);
        const testEmbed = logger.createBaseEmbed('🧪 Test de Logging', 0x00ffff)
          .setDescription('Este es un mensaje de prueba del sistema de logging')
          .addFields([
            { name: '👤 Ejecutado por', value: `<@${interaction.user.id}>`, inline: true },
            { name: '⏰ Fecha', value: new Date().toLocaleString('es-ES'), inline: true }
          ]);

        try {
          await logger.sendLog(testEmbed);
          await interaction.reply({
            content: '✅ Mensaje de prueba enviado al canal de logs',
            ephemeral: true
          });
        } catch (error) {
          await interaction.reply({
            content: '❌ Error al enviar el mensaje de prueba. Verifica que el canal de logs esté configurado correctamente.',
            ephemeral: true
          });
        }
        break;
      }

      case 'test-diario': {
        const logger = new LoggingSystem(client);

        try {
          await logger.logDailyMessage();
          await interaction.reply({
            content: '✅ Mensaje diario de prueba enviado al canal de logs',
            ephemeral: true
          });
        } catch (error) {
          await interaction.reply({
            content: '❌ Error al enviar el mensaje diario de prueba. Verifica que el canal de logs esté configurado correctamente.',
            ephemeral: true
          });
        }
        break;
      }

      case 'info': {
        const currentChannel = discordConfig.channelIds.LOGS_CHANNEL;
        let channelInfo = 'No configurado';

        if (currentChannel && currentChannel !== '1234567890123456789') {
          try {
            const logChannel = await client.channels.fetch(currentChannel);
            channelInfo = `${logChannel.name} (${logChannel.id})`;
          } catch {
            channelInfo = `ID: ${currentChannel} (Canal no encontrado)`;
          }
        }

        const infoEmbed = new EmbedBuilder()
          .setTitle('📊 Configuración de Logs')
          .setDescription('Estado actual del sistema de logging')
          .addFields([
            { name: '📍 Canal de Logs', value: channelInfo, inline: false },
            {
              name: '📝 Eventos Registrados',
              value: [
                '• Entrada y salida de miembros',
                '• Cambios de canales de voz',
                '• Acciones de moderación (ban, kick, timeout)',
                '• Mensajes eliminados y editados',
                '• Cambios de roles',
                '• Creación y eliminación de canales',
                '• Mensaje diario automático (00:00)'
              ].join('\n'),
              inline: false
            }
          ])
          .setColor(discordConfig.COLOR)
          .setTimestamp();

        await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
        break;
      }
    }
  }
};
