import { aseguradorasCatalog } from './aseguradorasCatalog';

describe('aseguradorasCatalog', () => {
  test('debe contener la aseguradora "ins" con la configuración correcta', () => {
    const ins = aseguradorasCatalog.ins;
    expect(ins).toBeDefined();

    expect(typeof ins.baseUrl).toBe('string');
    expect(ins.baseUrl).toContain('https://');

    expect(ins.oauthUrl).toBe(
      'https://apiintegracion.grupoins.com/connect/v1/token',
    );
    expect(ins.oauthClientId).toBe('3101858219');
    expect(ins.oauthClientSecret).toBe('7de5867a-c94a-0cc7-3a42-8caf21c7b072');
    expect(ins.subscriptionKey).toBe('78bb45ff26b94ea4a48c02da59e9f261');

    expect(ins.endpoints).toBeDefined();
    expect(ins.endpoints.gastosMedicosPreaturizacionInclusion).toBe(
      '/reclamos/v1/gastosmedicos/preautorizacion/inclusion',
    );
    expect(ins.endpoints.facturasInclusion).toBe(
      '/reclamos/v1/facturas/inclusion',
    );
    expect(ins.endpoints.gastosMedicosAdjuntosInclusion).toBe(
      '/reclamos/v1/gastosmedicos/adjuntos/inclusion',
    );
  });

  test('puede agregar más aseguradoras sin romper el catálogo', () => {
    expect(Object.keys(aseguradorasCatalog).length).toBeGreaterThanOrEqual(1);
  });
});
