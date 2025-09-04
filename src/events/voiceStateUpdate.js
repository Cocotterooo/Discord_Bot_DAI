import { VoiceState, MessageFlags, TextDisplayBuilder, ContainerBuilder } from 'discord.js'
import {
  startInactivityTimer,
  stopInactivityTimer,
  activeChannels
} from './buttons/canales_voz/voiceChannelHandler.js'
import LoggingSystem from '../utilities/loggingSystem.js'

export default {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const user = newState.member?.user
    if (!user || user.bot) return // Validación por si no hay usuario o es un bot

    const logger = new LoggingSystem(newState.client || oldState.client)

    // Manejar canales de voz personalizados
    await handleCustomVoiceChannels(oldState, newState)

    // Logging del sistema general de canales de voz
    if (!oldState.channel && newState.channel) {
      // Usuario se unió a un canal de voz
      await logger.logVoiceChannelJoin(newState.member, newState.channel)
    } else if (oldState.channel && !newState.channel) {
      // Usuario salió de un canal de voz
      await logger.logVoiceChannelLeave(oldState.member, oldState.channel)
    } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
      // Usuario se movió entre canales de voz
      await logger.logVoiceChannelMove(newState.member, oldState.channel, newState.channel)
    }
  }
}

async function handleCustomVoiceChannels(oldState, newState) {
  const client = newState.client || oldState.client

  // Si alguien se une a un canal personalizado
  if (newState.channel && activeChannels.has(newState.channel.id)) {
    // Log V2 de entrada
    await logUserJoinVoiceChannel(client, newState.member.user, newState.channel)

    // Detener el timer de inactividad
    stopInactivityTimer(newState.channel.id)

    // Si el canal está en estado 🔇, cambiarlo de vuelta a 🔊
    if (newState.channel.name.startsWith('🔇⦙')) {
      const channelData = activeChannels.get(newState.channel.id)
      if (channelData) {
        await newState.channel.setName(`🔊⦙${channelData.userName}`)
      }
    }
  }

  // Si alguien sale de un canal personalizado
  if (oldState.channel && activeChannels.has(oldState.channel.id)) {
    // Log V2 de salida
    await logUserLeaveVoiceChannel(client, oldState.member.user, oldState.channel)

    // Verificar si el canal quedó vacío
    if (oldState.channel.members.size === 0) {
      // Iniciar timer de inactividad
      startInactivityTimer(oldState.channel.id, client)
    }
  }
}

async function logUserJoinVoiceChannel(client, user, channel) {
  try {
    const LOG_CHANNEL_ID = '1395110127614296165'
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID)

    const container = new ContainerBuilder()

    const mensaje = new TextDisplayBuilder()
      .setContent(`### 🔊 UNIÓN · Canal Personalizado
                  > <@${user.id}> se unió a ${channel} \`${channel.name}\``)

    container.addTextDisplayComponents(mensaje)

    await logChannel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
      allowedMentions: { parse: [] }
    })
  } catch (error) {
    console.error('Error al registrar entrada al canal:', error)
  }
}

async function logUserLeaveVoiceChannel(client, user, channel) {
  try {
    const LOG_CHANNEL_ID = '1395110127614296165'
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID)

    const container = new ContainerBuilder()

    let contenido = `### 🔇 SALIDA · Canal Personalizado
                    > <@${user.id}> salió de ${channel} \`${channel.name}\``

    // Si el canal quedó vacío, añadir info sobre el timer
    if (channel.members.size === 0) {
      contenido += '\n> ⏰  Timer de eliminación reiniciado **(10 minutos)**'
    }

    const mensaje = new TextDisplayBuilder()
      .setContent(contenido)

    container.addTextDisplayComponents(mensaje)

    await logChannel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
      allowedMentions: { parse: [] }
    })
  } catch (error) {
    console.error('Error al registrar salida del canal:', error)
  }
}
