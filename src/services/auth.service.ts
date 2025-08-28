import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * Servicio encargado de obtener y almacenar tokens OAuth por aseguradora.
 * Implementa un cache en memoria para evitar múltiples peticiones innecesarias.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Cache en memoria de los tokens.
   * La clave es el nombre de la aseguradora (`insurance`),
   * y el valor es un objeto con el token y su tiempo de expiración en milisegundos.
   */
  private tokenCache: Record<string, { token: string; expiresAt: number }> = {};

  /**
   * Obtiene un token OAuth para una aseguradora específica.
   * Si ya existe uno en cache y no ha expirado, lo reutiliza.
   * @param clientId - ID del cliente OAuth
   * @param oauthUrl - URL del endpoint de token
   * @param clientSecret - Secreto del cliente OAuth
   * @param insurance - Nombre de la aseguradora (clave de cache)
   * @returns Token de acceso OAuth válido
   */
  async getOAuthToken(
    clientId: string,
    oauthUrl: string,
    clientSecret: string,
    insurance: string,
  ): Promise<string> {
    const now = Date.now();
    const cached = this.tokenCache[insurance];

    // Si el token existe y no ha expirado, se retorna del cache
    if (cached && cached.expiresAt > now) {
      return cached.token;
    }

    try {
      // Construye parámetros de solicitud para client_credentials
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      // Solicita nuevo token al servidor OAuth
      const response = await axios.post(oauthUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, expires_in } = response.data;
      // Calcula tiempo de expiración y guarda en cache
      const expiresAt = now + expires_in * 1000 - 60_000; // -60s para evitar expirar justo en el límite

      this.tokenCache[insurance] = { token: access_token, expiresAt };

      return access_token;
    } catch (error) {
      this.logger.error('Error obteniendo token OAuth', error);
      throw new Error('Network error');
    }
  }
}
