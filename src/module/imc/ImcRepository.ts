import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IImcRepository } from './IImcRepository';
import { GuardarImcDto } from './dto/guardar-imc-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Imc } from './entities/imc.entity';
import { Repository } from 'typeorm';
import { MostrarImcDto } from './dto/mostrar-imc-dto';

@Injectable()
export class ImcRepository implements IImcRepository {
  constructor(
    @InjectRepository(Imc)
    private readonly imcRepository: Repository<Imc>,
  ) {}

  async save(imcData: GuardarImcDto): Promise<void> {
    try {
      // Separar userId y asociar como relación
      const { userId, ...rest } = imcData;
      const imcEntity = this.imcRepository.create({
        ...rest,
        user: { id: userId },
      });
      await this.imcRepository.save(imcEntity);
    } catch {
      throw new InternalServerErrorException('Error saving IMC data');
    }
  }

  async findByUserId(userId: number): Promise<MostrarImcDto[]> {
    try {
      const imcs = await this.imcRepository.find({
        where: { user: { id: userId } },
        order: { fecha: 'DESC' }, // No se si poner el relation con user, porque te trae toda la info
      });
      return imcs.map((imc: Imc) => ({
        ...imc,
        userId: imc.user?.id,
      })) as MostrarImcDto[];
    } catch {
      throw new InternalServerErrorException(
        'Error retrieving user IMC history',
      );
    }
  }
}
