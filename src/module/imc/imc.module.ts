import { Module } from '@nestjs/common';
import { ImcService } from './imc.service';
import { ImcController } from './imc.controller';
import { Imc } from './entities/imc.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImcRepository } from './ImcRepository';

@Module({
  imports: [TypeOrmModule.forFeature([Imc])],
  controllers: [ImcController],
  providers: [
    ImcService,
    {
      provide: 'IImcRepository',
      useClass: ImcRepository,
    },
  ],
  exports: [ImcService, TypeOrmModule],
})
export class ImcModule {}
