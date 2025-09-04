import express from 'express'
import cors from 'cors'

/**
 * Servidor API REST para el Discord Bot DAI
 * Proporciona endpoints para obtener información sobre el servidor de Discord
 */
class APIServer {
  constructor (client) {
    this.client = client
    this.app = express()
    this.port = process.env.API_PORT || 3000

    this.setupMiddleware()
    this.setupRoutes()
  }

  setupMiddleware () {
    // Habilitar CORS para todas las rutas
    this.app.use(cors())

    // Middleware para parsear JSON
    this.app.use(express.json())

    // Middleware para logging básico
    this.app.use((req, res, next) => {
      console.log(`[API] ${req.method} ${req.path} - ${new Date().toISOString()}`)
      next()
    })
  }

  setupRoutes () {
    // Endpoint de salud
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        botStatus: this.client.isReady() ? 'connected' : 'disconnected'
      })
    })

    // Endpoint para obtener información total de usuarios
    this.app.get('/totalUsers', async (req, res) => {
      try {
        const guild = this.client.guilds.cache.first()

        if (!guild) {
          return res.status(404).json({
            error: 'No se encontró el servidor de Discord'
          })
        }

        // Obtener todos los miembros del servidor
        await guild.members.fetch()

        const totalUsers = guild.memberCount
        const members = guild.members.cache

        // Contar usuarios por estado de presencia
        let online = 0
        let dnd = 0 // Do Not Disturb (No molestar)
        let idle = 0 // Ausente
        let offline = 0

        members.forEach(member => {
          if (member.user.bot) return // Excluir bots del conteo

          const presence = member.presence
          if (!presence) {
            offline++
            return
          }

          switch (presence.status) {
            case 'online':
              online++
              break
            case 'dnd':
              dnd++
              break
            case 'idle':
              idle++
              break
            case 'offline':
            default:
              offline++
              break
          }
        })

        // Contar usuarios reales (sin bots)
        const realUsers = members.filter(member => !member.user.bot).size
        const bots = totalUsers - realUsers

        const response = {
          serverName: guild.name,
          totalMembers: totalUsers,
          realUsers,
          bots,
          userStatus: {
            online,
            dnd,
            idle,
            offline
          },
          timestamp: new Date().toISOString()
        }

        res.json(response)
      } catch (error) {
        console.error('[API] Error en endpoint /totalUsers:', error)
        res.status(500).json({
          error: 'Error interno del servidor',
          message: error.message
        })
      }
    })

    // Endpoint para obtener información básica del servidor
    this.app.get('/serverInfo', async (req, res) => {
      try {
        const guild = this.client.guilds.cache.first()

        if (!guild) {
          return res.status(404).json({
            error: 'No se encontró el servidor de Discord'
          })
        }

        const response = {
          name: guild.name,
          id: guild.id,
          memberCount: guild.memberCount,
          createdAt: guild.createdAt,
          description: guild.description,
          iconURL: guild.iconURL(),
          bannerURL: guild.bannerURL(),
          timestamp: new Date().toISOString()
        }

        res.json(response)
      } catch (error) {
        console.error('[API] Error en endpoint /serverInfo:', error)
        res.status(500).json({
          error: 'Error interno del servidor',
          message: error.message
        })
      }
    })

    // Endpoint para obtener el status de usuarios específicos (sedes)
    this.app.get('/locals', async (req, res) => {
      try {
        const guild = this.client.guilds.cache.first()

        if (!guild) {
          return res.status(404).json({
            error: 'No se encontró el servidor de Discord'
          })
        }

        // IDs de los usuarios de las sedes
        const sedeCiudad = '1296744816901885973' // Sede ciudad
        const sedeCampus = '1296739204033675267' // Sede campus

        // Función para obtener el status de un usuario
        const getUserStatus = async (userId) => {
          try {
            const member = await guild.members.fetch(userId)
            if (!member) return 'offline'

            return member.presence?.status || 'offline'
          } catch (error) {
            console.error(`[API] Error fetching user ${userId}:`, error)
            return 'unknown'
          }
        }

        // Obtener status de ambos usuarios
        const [ciudadStatus, campusStatus] = await Promise.all([
          getUserStatus(sedeCiudad),
          getUserStatus(sedeCampus)
        ])

        const response = {
          sedeciudad: ciudadStatus,
          sedecampus: campusStatus
        }

        res.json(response)
      } catch (error) {
        console.error('[API] Error en endpoint /locals:', error)
        res.status(500).json({
          error: 'Error interno del servidor',
          message: error.message
        })
      }
    })

    // Manejo de rutas no encontradas
    this.app.use((req, res) => {
      res.status(404).json({
        error: 'Endpoint no encontrado',
        availableEndpoints: ['/health', '/totalUsers', '/serverInfo', '/locals']
      })
    })
  }

  start () {
    this.server = this.app.listen(this.port, () => {
      console.log(`[API] Servidor iniciado en http://localhost:${this.port}`.green)
      console.log('[API] Endpoints disponibles:'.cyan)
      console.log('  - GET /health - Estado del servidor y bot'.cyan)
      console.log('  - GET /totalUsers - Información de usuarios del servidor'.cyan)
      console.log('  - GET /serverInfo - Información básica del servidor'.cyan)
      console.log('  - GET /locals - Status de usuarios de las sedes (ciudad/campus)'.cyan)
    })
  }

  stop () {
    if (this.server) {
      this.server.close(() => {
        console.log('[API] Servidor detenido'.yellow)
      })
    }
  }
}

// Exportación por defecto
export default APIServer
