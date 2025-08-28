import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { aseguradorasCatalog } from './catalog/aseguradorasCatalog';
import { AuthService } from '../services/auth.service';
import axios from 'axios';
import { ExternalApiRequestDto } from './dto/external-api.dto';
import { HttpExternalClientService } from '../common/http-external-client.service';

/**
 * Servicio que orquesta llamadas HTTP a las APIs externas de las aseguradoras.
 */
@Injectable()
export class ExternalApiService {
  constructor(
    private readonly authService: AuthService,
    private readonly httpClient: HttpExternalClientService,
  ) {}

  /**
   * Llama al endpoint configurado de una aseguradora externa.
   * @param dto - Objeto con datos de la solicitud (incluye aseguradora, método y payload)
   * @returns Respuesta de la API externa
   */
  async callExternalApi(dto: ExternalApiRequestDto) {
    const { insurance, method, data } = dto;

    // Obtiene configuración de la aseguradora
    const config = aseguradorasCatalog[insurance];

    if (!config) {
      throw new BadRequestException(
        `Aseguradora "${insurance}" no está configurada`,
      );
    }

    // Verifica si el método solicitado está soportado por la aseguradora
    const endpointPath = config.endpoints[method];
    if (!endpointPath) {
      throw new BadRequestException(
        `Método "${method}" no está disponible para ${insurance}`,
      );
    }

    const fullUrl = `${config.baseUrl}${endpointPath}`;

    try {
      // Obtiene token OAuth con cache para la aseguradora
      const token = await this.authService.getOAuthToken(
        config.oauthClientId,
        config.oauthUrl,
        config.oauthClientSecret,
        insurance, // clave de cache
      );

      const response = await this.httpClient.post(
        fullUrl,
        data,
        token,
        config.subscriptionKey,
      );

      return {
        status: 'success',
        response,
      };
    } catch (error) {
      const status = error?.response?.data?.status || 500;
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.internalErrorCode ||
        'Error desconocido';

      throw new InternalServerErrorException({ status, message });
    }
  }
}
