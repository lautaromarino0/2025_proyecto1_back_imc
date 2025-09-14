import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CalcularImcDto } from './calcular-imc-dto';

describe('IMC DTO Validations', () => {
  it('debería fallar si el peso no es un número', async () => {
    const input = { peso: 'no-es-numero', altura: 1.7 };
    const dto = plainToInstance(CalcularImcDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'peso')).toBe(true);
  });

  it('debería fallar si la altura no es un número', async () => {
    const input = { peso: 70, altura: 'no-es-numero' };
    const dto = plainToInstance(CalcularImcDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'altura')).toBe(true);
  });
  it('debería fallar si el peso es negativo', async () => {
    const input = { peso: -10, altura: 1.7 };
    const dto = plainToInstance(CalcularImcDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'peso')).toBe(true);
  });

  it('debería fallar si el peso es cero', async () => {
    const input = { peso: 0, altura: 1.7 };
    const dto = plainToInstance(CalcularImcDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'peso')).toBe(true);
  });

  it('debería fallar si el peso es mayor a 500', async () => {
    const input = { peso: 501, altura: 1.7 };
    const dto = plainToInstance(CalcularImcDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'peso')).toBe(true);
  });

  it('debería fallar si la altura es negativa', async () => {
    const input = { peso: 70, altura: -1.7 };
    const dto = plainToInstance(CalcularImcDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'altura')).toBe(true);
  });

  it('debería fallar si la altura es cero', async () => {
    const input = { peso: 70, altura: 0 };
    const dto = plainToInstance(CalcularImcDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'altura')).toBe(true);
  });

  it('debería fallar si la altura es mayor a 3', async () => {
    const input = { peso: 70, altura: 3.1 };
    const dto = plainToInstance(CalcularImcDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'altura')).toBe(true);
  });

  it('debería pasar si el peso y altura son válidos', async () => {
    const input = { peso: 70, altura: 1.75 };
    const dto = plainToInstance(CalcularImcDto, input);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
