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
        relations: ['user'],
        order: { fecha: 'DESC' },
      });
      return imcs.map((imc: Imc) => ({
        id: imc.id,
        peso: imc.peso,
        altura: imc.altura,
        imc: imc.imc,
        categoria: imc.categoria,
        fecha: imc.fecha,
        userId: imc.user.id,
      })) as MostrarImcDto[];
    } catch {
      throw new InternalServerErrorException(
        'Error retrieving user IMC history',
      );
    }
  }
}
