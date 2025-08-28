import { AuthService } from './auth.service';
import axios from 'axios';

jest.mock('axios');

describe('AuthService', () => {
  let service: AuthService;

  const mockTokenResponse = {
    data: {
      access_token: 'mocked-access-token',
      expires_in: 3600, // 1 hora
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService();
  });

  const clientId = 'client-id';
  const clientSecret = 'client-secret';
  const oauthUrl = 'https://oauth.example.com/token';
  const insurance = 'test-insurance';

  it('debe obtener un nuevo token si no hay en cache', async () => {
    (axios.post as jest.Mock).mockResolvedValue(mockTokenResponse);

    const token = await service.getOAuthToken(
      clientId,
      oauthUrl,
      clientSecret,
      insurance,
    );

    expect(axios.post).toHaveBeenCalledWith(
      oauthUrl,
      expect.any(URLSearchParams),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    expect(token).toBe('mocked-access-token');
  });

  it('debe reutilizar token del cache si no ha expirado', async () => {
    const future = Date.now() + 100000;
    (service as any).tokenCache[insurance] = {
      token: 'cached-token',
      expiresAt: future,
    };

    const token = await service.getOAuthToken(
      clientId,
      oauthUrl,
      clientSecret,
      insurance,
    );

    expect(axios.post).not.toHaveBeenCalled();
    expect(token).toBe('cached-token');
  });

  it('debe solicitar nuevo token si el cache expiró', async () => {
    const past = Date.now() - 1000;
    (service as any).tokenCache[insurance] = {
      token: 'expired-token',
      expiresAt: past,
    };

    (axios.post as jest.Mock).mockResolvedValue(mockTokenResponse);

    const token = await service.getOAuthToken(
      clientId,
      oauthUrl,
      clientSecret,
      insurance,
    );

    expect(axios.post).toHaveBeenCalled();
    expect(token).toBe('mocked-access-token');
  });

  it('should throw error and log on axios failure', async () => {
    const error = new Error('Request failed');
    (axios.post as jest.Mock).mockRejectedValue(error);

    jest.spyOn(service['logger'], 'error').mockImplementation(() => {});

    await expect(
      service.getOAuthToken('id', 'url', 'secret', 'ins'),
    ).rejects.toThrow('Network error');
  });
});
