import { IImcEvolucionDTO } from './dto/imc-evolucion-dto';
import { IMetricasDTO } from './dto/metricas-dto';
import { IPesoEvolucionDTO } from './dto/peso-evolucion-dto';

export interface IStatsRepository {
  getUserImcStats(userId: string): Promise<IImcEvolucionDTO[]>;
  getUserWeightStats(userId: string): Promise<IPesoEvolucionDTO[]>;
  getUserAggregatedStats(userId: string): Promise<IMetricasDTO>;
}
