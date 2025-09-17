import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stats')
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // 1. Evolución de IMC a lo largo del tiempo
  @Get('imc-evolucion')
  async getImcEvolucion(@Req() req) {
    return this.statsService.getUserImcStats(req.user.id);
  }

  // 2. Evolución de peso a lo largo del tiempo
  @Get('peso-evolucion')
  async getPesoEvolucion(@Req() req) {
    return this.statsService.getUserWeightStats(req.user.id);
  }

  // 3. Métricas agregadas: promedio, variación, conteo por categoría
  @Get('metricas')
  async getMetricas(@Req() req) {
    return this.statsService.getUserAggregatedStats(req.user.id);
  }
}
