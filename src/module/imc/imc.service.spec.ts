import { Test, TestingModule } from '@nestjs/testing';
import { ImcService } from './imc.service';
import { CalcularImcDto } from './dto/calcular-imc-dto';

describe('ImcService', () => {
  let service: ImcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImcService],
    }).compile();

    service = module.get<ImcService>(ImcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate IMC correctly', () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 70 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(22.86, 2); // Redondeado a 2 decimales
    expect(result.categoria).toBe('Normal');
  });

  it('should return Bajo peso for IMC < 18.5', () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 50 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(16.33, 2);
    expect(result.categoria).toBe('Bajo peso');
  });
  it('should return Normal for 18.5 <= IMC < 25', () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 68 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(22.2, 2);
    expect(result.categoria).toBe('Normal');
  });

  it('should return Sobrepeso for 25 <= IMC < 30', () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 80 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(26.12, 2);
    expect(result.categoria).toBe('Sobrepeso');
  });

  it('should return Obeso for IMC >= 30', () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: 100 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(32.65, 2);
    expect(result.categoria).toBe('Obeso');
  });

  it('should return error for non-positive altura', () => {
    const dto: CalcularImcDto = { altura: 0, peso: 70 };
    expect(() => service.calcularImc(dto)).toThrow(
      'Altura must be greater than 0',
    );
  });

  it('should return error for non-positive peso', () => {
    const dto: CalcularImcDto = { altura: 1.75, peso: -10 };
    expect(() => service.calcularImc(dto)).toThrow(
      'Peso must be greater than 0',
    );
  });
});
