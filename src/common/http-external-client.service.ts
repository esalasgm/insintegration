// src/common/http-external-client.service.ts
import { Injectable } from '@nestjs/common';
import axios, { AxiosHeaders, AxiosRequestHeaders } from 'axios';

@Injectable()
export class HttpExternalClientService {
  /**
   * Ejecuta una petición POST externa con headers custom y manejo de errores.
   * @param url - URL del endpoint
   * @param data - Payload
   * @param token - Token de autenticación Bearer
   * @param subscriptionKey - Llave de suscripción si aplica
   */
  async post(url: string, data: any, token: string, subscriptionKey?: string) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    if (subscriptionKey) {
      headers['subscription-key'] = subscriptionKey;
    }
    try {
      const response = await axios.post(url, data, { headers });
      return response.data;
    } catch (error) {
      // Re-throw error para que lo maneje el servicio superior
      throw error;
    }
  }
}
