import { Module } from '@nestjs/common';

import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { StatsRepository } from './StatsRepository';
import { Imc } from '../imc/entities/imc.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Imc])],
  controllers: [StatsController],
  providers: [
    StatsService,
    {
      provide: 'IStatsRepository',
      useClass: StatsRepository,
    },
    StatsRepository,
  ],
})
export class StatsModule {}
