import { AseguradoraEndpointConfig } from '../interfaces/aseguradora-config.interface';

export const aseguradorasCatalog: Record<string, AseguradoraEndpointConfig> = {
  ins: {
    baseUrl: 'https://apiintegracion.grupoins.com',
    endpoints: {
      gastosMedicosPreaturizacionInclusion:
        '/reclamos/v1/gastosmedicos/preautorizacion/inclusion',
      facturasInclusion: '/reclamos/v1/facturas/inclusion',
      gastosMedicosAdjuntosInclusion:
        '/reclamos/v1/gastosmedicos/adjuntos/inclusion',
    },
    oauthUrl: 'https://apiintegracion.grupoins.com/connect/v1/token',
    oauthClientId: '3101858219',
    oauthClientSecret: '7de5867a-c94a-0cc7-3a42-8caf21c7b072',
    subscriptionKey: '78bb45ff26b94ea4a48c02da59e9f261',
  },
  // Agrega más aseguradoras aquí
};
