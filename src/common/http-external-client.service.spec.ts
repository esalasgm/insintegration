import { Test, TestingModule } from '@nestjs/testing';
import { HttpExternalClientService } from './http-external-client.service';
import axios from 'axios';

jest.mock('axios');

describe('HttpExternalClientService', () => {
  let service: HttpExternalClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExternalClientService],
    }).compile();

    service = module.get<HttpExternalClientService>(HttpExternalClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const url = 'https://example.com/api';
  const data = { key: 'value' };
  const token = 'mocked-token';
  const subscriptionKey = 'mocked-subscription-key';

  it('debe realizar una petición POST con headers correctamente configurados', async () => {
    const mockResponse = { data: { success: true } };
    (axios.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await service.post(url, data, token, subscriptionKey);

    expect(axios.post).toHaveBeenCalledWith(
      url,
      data,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${token}`,
          'subscription-key': subscriptionKey,
          'Content-Type': 'application/json',
        }),
      }),
    );

    expect(result).toEqual(mockResponse.data);
  });

  it('debe lanzar error si axios.post falla', async () => {
    const mockError = new Error('Error de red');
    (axios.post as jest.Mock).mockRejectedValue(mockError);

    await expect(
      service.post(url, data, token, subscriptionKey),
    ).rejects.toThrow('Error de red');
  });
});
