import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';

describe('StatsService', () => {
  let service: StatsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      getUserImcStats: jest.fn(),
      getUserWeightStats: jest.fn(),
      getUserAggregatedStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: 'IStatsRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserImcStats', () => {
    it('should call repository.getUserImcStats with userId and return result', async () => {
      const userId = '1';
      const expectedResult = [{ imc: 25, fecha: new Date() }];
      mockRepository.getUserImcStats.mockResolvedValue(expectedResult);

      const result = await service.getUserImcStats(userId);

      expect(mockRepository.getUserImcStats).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserWeightStats', () => {
    it('should call repository.getUserWeightStats with userId and return result', async () => {
      const userId = '1';
      const expectedResult = [{ peso: 70, fecha: new Date() }];
      mockRepository.getUserWeightStats.mockResolvedValue(expectedResult);

      const result = await service.getUserWeightStats(userId);

      expect(mockRepository.getUserWeightStats).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getUserAggregatedStats', () => {
    it('should call repository.getUserAggregatedStats with userId and return result', async () => {
      const userId = '1';
      const expectedResult = {
        promedioImc: 25,
        variacionImc: 2,
        promedioPeso: 70,
        variacionPeso: 5,
        conteoCategorias: { Normal: 10 },
      };
      mockRepository.getUserAggregatedStats.mockResolvedValue(expectedResult);

      const result = await service.getUserAggregatedStats(userId);

      expect(mockRepository.getUserAggregatedStats).toHaveBeenCalledWith('1');
      expect(result).toEqual(expectedResult);
    });
  });
});
