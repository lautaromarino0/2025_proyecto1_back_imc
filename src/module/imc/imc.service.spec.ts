import { GuardarImcDto } from './dto/guardar-imc-dto';
import { Test, TestingModule } from '@nestjs/testing';
import { ImcService } from './imc.service';

describe('ImcService', () => {
  let service: ImcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImcService,
        {
          provide: 'IImcRepository',
          useValue: {
            save: jest.fn(),
            findByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ImcService>(ImcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should calculate IMC correctly', () => {
    const dto = { altura: 1.75, peso: 70, userId: 1 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(22.86, 2); // Redondeado a 2 decimales
    expect(result.categoria).toBe('Normal');
  });

  it('should call guardarImc when calcularImc is called', () => {
    const dto = { altura: 1.75, peso: 70, userId: 1 };
    const repo = (service as any).imcRepository;
    jest.spyOn(service, 'guardarImc').mockImplementation(jest.fn());
    service.calcularImc(dto);
    expect(service.guardarImc).toHaveBeenCalledWith(expect.objectContaining({
      altura: dto.altura,
      peso: dto.peso,
      imc: expect.any(Number),
      categoria: expect.any(String),
      userId: dto.userId,
    }));
  });

  it('should call imcRepository.save when guardarImc is called', async () => {
    const repo = (service as any).imcRepository;
    const guardarDto: GuardarImcDto = { altura: 1.75, peso: 70, imc: 22.86, categoria: 'Normal', userId: 1 };
    await service.guardarImc(guardarDto);
    expect(repo.save).toHaveBeenCalledWith(guardarDto);
  });

  it('should call imcRepository.findByUserId when obtenerHistorialPorUsuario is called', async () => {
    const repo = (service as any).imcRepository;
    await service.obtenerHistorialPorUsuario(1);
    expect(repo.findByUserId).toHaveBeenCalledWith(1);
  });

  it('should return Bajo peso for IMC < 18.5', () => {
    const dto = { altura: 1.75, peso: 50, userId: 1 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(16.33, 2);
    expect(result.categoria).toBe('Bajo peso');
  });
  it('should return Normal for 18.5 <= IMC < 25', () => {
    const dto = { altura: 1.75, peso: 68, userId: 1 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(22.2, 2);
    expect(result.categoria).toBe('Normal');
  });

  it('should return Sobrepeso for 25 <= IMC < 30', () => {
    const dto = { altura: 1.75, peso: 80, userId: 1 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(26.12, 2);
    expect(result.categoria).toBe('Sobrepeso');
  });

  it('should return Obeso for IMC >= 30', () => {
    const dto = { altura: 1.75, peso: 100, userId: 1 };
    const result = service.calcularImc(dto);
    expect(result.imc).toBeCloseTo(32.65, 2);
    expect(result.categoria).toBe('Obeso');
  });

  it('should return error for non-positive altura', () => {
    const dto = { altura: 0, peso: 70, userId: 1 };
    expect(() => service.calcularImc(dto)).toThrow(
      'Altura must be greater than 0',
    );
  });

  it('should return error for non-positive peso', () => {
    const dto = { altura: 1.75, peso: -10, userId: 1 };
    expect(() => service.calcularImc(dto)).toThrow(
      'Peso must be greater than 0',
    );
  });
});
