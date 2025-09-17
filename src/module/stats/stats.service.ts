import { Injectable, Inject } from '@nestjs/common';
import { IStatsRepository } from './IStatsRepository';
import { IImcEvolucionDTO } from './dto/imc-evolucion-dto';
import { IPesoEvolucionDTO } from './dto/peso-evolucion-dto';
import { IMetricasDTO } from './dto/metricas-dto';

@Injectable()
export class StatsService {
  constructor(
    @Inject('IStatsRepository')
    private readonly statsRepository: IStatsRepository,
  ) {}

  // Métodos que delegan en el repositorio
  getUserImcStats(userId: string): Promise<IImcEvolucionDTO[]> {
    return this.statsRepository.getUserImcStats(userId);
  }

  getUserWeightStats(userId: string): Promise<IPesoEvolucionDTO[]> {
    return this.statsRepository.getUserWeightStats(userId);
  }

  getUserAggregatedStats(userId: string): Promise<IMetricasDTO> {
    return this.statsRepository.getUserAggregatedStats(userId);
  }
}
