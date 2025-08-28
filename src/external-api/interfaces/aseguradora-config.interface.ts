export interface AseguradoraEndpointConfig {
  baseUrl: string;
  endpoints: Record<string, string>;
  oauthUrl: string;
  oauthClientId: string;
  oauthClientSecret: string;
  subscriptionKey: string;
}
