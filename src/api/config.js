/**
 * Configuración de la API REST
 */
export const apiConfig = {
  port: process.env.API_PORT || 3000,
  host: process.env.API_HOST || 'localhost',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 requests por ventana de tiempo por IP
  }
}
