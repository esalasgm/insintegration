import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ExternalApiService } from './external-api/external-api.service';
import { ExternalApiRequestDto } from './external-api/dto/external-api.dto';

describe('AppController', () => {
  let appController: AppController;
  let externalApiService: ExternalApiService;

  const mockExternalApiService = {
    callExternalApi: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: ExternalApiService,
          useValue: mockExternalApiService,
        },
      ],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
    externalApiService = moduleRef.get<ExternalApiService>(ExternalApiService);
  });

  it('should call ExternalApiService.callExternalApi with correct payload', async () => {
    const dto: ExternalApiRequestDto = {
      insurance: 'ins',
      method: 'facturasInclusion',
      data: {
        clave: 'valor',
      },
    };

    const mockResponse = {
      status: 'success',
      response: { mensaje: 'ok' },
    };

    mockExternalApiService.callExternalApi.mockResolvedValue(mockResponse);

    const result = await appController.consultaDinamica(dto);

    expect(mockExternalApiService.callExternalApi).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockResponse);
  });
});
