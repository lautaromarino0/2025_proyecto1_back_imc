import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IStatsRepository } from './IStatsRepository';
import { InjectRepository } from '@nestjs/typeorm';
import { Imc } from '../imc/entities/imc.entity';
import { Repository } from 'typeorm';
import { IMetricasDTO } from './dto/metricas-dto';
import { IImcEvolucionDTO } from './dto/imc-evolucion-dto';
import { IPesoEvolucionDTO } from './dto/peso-evolucion-dto';

@Injectable()
export class StatsRepository implements IStatsRepository {
  constructor(
    @InjectRepository(Imc)
    private readonly imcRepository: Repository<Imc>,
  ) {}

  async getUserImcStats(userId: string): Promise<IImcEvolucionDTO[]> {
    try {
      const imcs = await this.imcRepository.find({
        where: { user: { id: Number(userId) } },
        order: { fecha: 'ASC' },
        select: ['imc', 'fecha'],
      });
      return imcs;
    } catch {
      throw new InternalServerErrorException(
        'Error al obtener la evolución de IMC',
      );
    }
  }

  async getUserWeightStats(userId: string): Promise<IPesoEvolucionDTO[]> {
    try {
      const pesos = await this.imcRepository.find({
        where: { user: { id: Number(userId) } },
        order: { fecha: 'ASC' },
        select: ['peso', 'fecha'],
      });
      return pesos;
    } catch {
      throw new InternalServerErrorException(
        'Error al obtener la evolución de peso',
      );
    }
  }

  async getUserAggregatedStats(userId: string): Promise<IMetricasDTO> {
    try {
      // Promedio y variación de IMC y peso
      const result = await this.imcRepository
        .createQueryBuilder('imc')
        .select('AVG(imc.imc)', 'imcPromedio')
        .addSelect('STDDEV(imc.imc)', 'imcDesviacion')
        .addSelect('AVG(imc.peso)', 'pesoPromedio')
        .addSelect('STDDEV(imc.peso)', 'pesoDesviacion')
        .where('imc.user = :userId', { userId: Number(userId) })
        .getRawOne();

      // Conteo por categoría
      const categorias = await this.imcRepository
        .createQueryBuilder('imc')
        .select('imc.categoria', 'categoria')
        .addSelect('COUNT(*)', 'cantidad')
        .where('imc.user = :userId', { userId: Number(userId) })
        .groupBy('imc.categoria')
        .getRawMany();

      return {
        ...result,
        categorias,
      };
    } catch {
      throw new InternalServerErrorException(
        'Error al obtener métricas agregadas',
      );
    }
  }
}
