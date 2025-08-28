import { Test, TestingModule } from '@nestjs/testing';
import { ExternalApiService } from './external-api.service';
import { AuthService } from '../services/auth.service';
import { HttpExternalClientService } from '../common/http-external-client.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ExternalApiRequestDto } from './dto/external-api.dto';
import { aseguradorasCatalog } from './catalog/aseguradorasCatalog';

describe('ExternalApiService', () => {
  let service: ExternalApiService;
  let mockAuthService: AuthService;
  let mockHttpClient: HttpExternalClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalApiService,
        {
          provide: AuthService,
          useValue: {
            getOAuthToken: jest.fn(),
          },
        },
        {
          provide: HttpExternalClientService,
          useValue: {
            post: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExternalApiService>(ExternalApiService);
    mockAuthService = module.get<AuthService>(AuthService);
    mockHttpClient = module.get<HttpExternalClientService>(
      HttpExternalClientService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const validDto: ExternalApiRequestDto = {
    insurance: 'ins',
    method: 'gastosMedicosPreaturizacionInclusion',
    data: { numeroIdentificacionProveedor: '3101569075' },
  };

  it('debe lanzar BadRequestException si aseguradora no está configurada', async () => {
    const dto = { ...validDto, insurance: 'noExiste' };
    await expect(service.callExternalApi(dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('debe lanzar BadRequestException si método no está disponible', async () => {
    const dto = { ...validDto, method: 'metodoInexistente' };
    await expect(service.callExternalApi(dto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('debe llamar a AuthService y HttpClient con los parámetros correctos y retornar éxito', async () => {
    (mockAuthService.getOAuthToken as jest.Mock).mockResolvedValue(
      'mocked-token',
    );
    (mockHttpClient.post as jest.Mock).mockResolvedValue({ resultado: 'ok' });

    const result = await service.callExternalApi(validDto);

    const config = aseguradorasCatalog['ins'];
    const expectedUrl = `${config.baseUrl}${config.endpoints[validDto.method]}`;

    expect(mockAuthService.getOAuthToken).toHaveBeenCalledWith(
      config.oauthClientId,
      config.oauthUrl,
      config.oauthClientSecret,
      'ins',
    );

    expect(mockHttpClient.post).toHaveBeenCalledWith(
      expectedUrl,
      validDto.data,
      'mocked-token',
      config.subscriptionKey,
    );

    expect(result).toEqual({
      status: 'success',
      response: { resultado: 'ok' },
    });
  });

  it('debe lanzar InternalServerErrorException si ocurre un error en el request', async () => {
    (mockAuthService.getOAuthToken as jest.Mock).mockResolvedValue(
      'mocked-token',
    );
    (mockHttpClient.post as jest.Mock).mockRejectedValue({
      response: {
        data: {
          status: 400,
          detail: 'Error en servicio externo',
        },
      },
    });

    await expect(service.callExternalApi(validDto)).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('debe lanzar InternalServerErrorException con status y message de response.data', async () => {
    (mockAuthService.getOAuthToken as jest.Mock).mockResolvedValue(
      'mocked-token',
    );
    (mockHttpClient.post as jest.Mock).mockRejectedValue({
      response: {
        data: {
          status: 404,
          detail: 'Recurso no encontrado',
        },
      },
    });

    await expect(service.callExternalApi(validDto)).rejects.toMatchObject({
      response: {
        status: 404,
        message: 'Recurso no encontrado',
      },
    });
  });

  it('debe lanzar InternalServerErrorException con status y message de internalErrorCode si detail no existe', async () => {
    (mockAuthService.getOAuthToken as jest.Mock).mockResolvedValue(
      'mocked-token',
    );
    (mockHttpClient.post as jest.Mock).mockRejectedValue({
      response: {
        data: {
          status: 500,
          internalErrorCode: 'ERROR_INTERNO_123',
        },
      },
    });

    await expect(service.callExternalApi(validDto)).rejects.toMatchObject({
      response: {
        status: 500,
        message: 'ERROR_INTERNO_123',
      },
    });
  });

  it('debe lanzar InternalServerErrorException con status 500 y mensaje "Error desconocido" si no hay detalles en error.response.data', async () => {
    (mockAuthService.getOAuthToken as jest.Mock).mockResolvedValue(
      'mocked-token',
    );
    (mockHttpClient.post as jest.Mock).mockRejectedValue({
      response: {
        data: {},
      },
    });

    await expect(service.callExternalApi(validDto)).rejects.toMatchObject({
      response: {
        status: 500,
        message: 'Error desconocido',
      },
    });
  });

  it('debe lanzar InternalServerErrorException con status 500 y mensaje "Error desconocido" si error no tiene response', async () => {
    (mockAuthService.getOAuthToken as jest.Mock).mockResolvedValue(
      'mocked-token',
    );
    (mockHttpClient.post as jest.Mock).mockRejectedValue(
      new Error('fail sin response'),
    );

    await expect(service.callExternalApi(validDto)).rejects.toMatchObject({
      response: {
        status: 500,
        message: 'Error desconocido',
      },
    });
  });

  it('debe lanzar InternalServerErrorException si getOAuthToken falla', async () => {
    (mockAuthService.getOAuthToken as jest.Mock).mockRejectedValue(
      new Error('OAuth fail'),
    );

    await expect(service.callExternalApi(validDto)).rejects.toMatchObject({
      response: {
        status: 500,
        message: 'Error desconocido',
      },
    });
  });
});
