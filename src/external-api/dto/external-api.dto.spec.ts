import { validate } from 'class-validator';
import { ExternalApiRequestDto } from './external-api.dto';

describe('ExternalApiRequestDto', () => {
  it('debe validar correctamente un objeto válido', async () => {
    const dto = new ExternalApiRequestDto();
    dto.insurance = 'ins';
    dto.method = 'gastosMedicosPreaturizacionInclusion';
    dto.data = { someKey: 'someValue' };

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('debe fallar si falta insurance', async () => {
    const dto = new ExternalApiRequestDto();
    dto.method = 'method';
    dto.data = { key: 'value' };

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'insurance')).toBe(true);
  });

  it('debe fallar si insurance no es string', async () => {
    const dto = new ExternalApiRequestDto();
    // @ts-ignore
    dto.insurance = 123;
    dto.method = 'method';
    dto.data = { key: 'value' };

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'insurance')).toBe(true);
  });

  it('debe fallar si data no es objeto', async () => {
    const dto = new ExternalApiRequestDto();
    dto.insurance = 'ins';
    dto.method = 'method';
    // @ts-ignore
    dto.data = 'not-an-object';

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'data')).toBe(true);
  });

  it('debe fallar si method está vacío', async () => {
    const dto = new ExternalApiRequestDto();
    dto.insurance = 'ins';
    dto.method = '';
    dto.data = { key: 'value' };

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'method')).toBe(true);
  });
});
