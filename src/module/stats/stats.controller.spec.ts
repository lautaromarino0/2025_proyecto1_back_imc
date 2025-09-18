import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

describe('StatsController', () => {
  let controller: StatsController;
  let statsService: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: StatsService,
          useValue: {
            getUserImcStats: jest.fn(),
            getUserWeightStats: jest.fn(),
            getUserAggregatedStats: jest.fn(),
          },
        },
        {
          provide: 'IStatsRepository',
          useValue: {
            getUserImcStats: jest.fn(),
            getUserWeightStats: jest.fn(),
            getUserAggregatedStats: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    statsService = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getImcEvolucion', () => {
    it('should call statsService.getUserImcStats with userId and return result', async () => {
      const mockRequest = { user: { id: 1 } } as any;
      const result = [{ imc: 25, fecha: new Date() }];
      (statsService.getUserImcStats as jest.Mock).mockResolvedValue(result);

      expect(await controller.getImcEvolucion(mockRequest)).toEqual(result);
      expect(statsService.getUserImcStats).toHaveBeenCalledWith(1);
    });
  });

  describe('getPesoEvolucion', () => {
    it('should call statsService.getUserWeightStats with userId and return result', async () => {
      const mockRequest = { user: { id: 1 } } as any;
      const result = [{ peso: 70, fecha: new Date() }];
      (statsService.getUserWeightStats as jest.Mock).mockResolvedValue(result);

      expect(await controller.getPesoEvolucion(mockRequest)).toEqual(result);
      expect(statsService.getUserWeightStats).toHaveBeenCalledWith(1);
    });
  });

  describe('getMetricas', () => {
    it('should call statsService.getUserAggregatedStats with userId and return result', async () => {
      const mockRequest = { user: { id: 1 } } as any;
      const result = {
        promedioImc: 25,
        variacionImc: 2,
        promedioPeso: 70,
        variacionPeso: 5,
        conteoCategorias: { Normal: 10 },
      };
      (statsService.getUserAggregatedStats as jest.Mock).mockResolvedValue(
        result,
      );

      expect(await controller.getMetricas(mockRequest)).toEqual(result);
      expect(statsService.getUserAggregatedStats).toHaveBeenCalledWith(1);
    });
  });
});
