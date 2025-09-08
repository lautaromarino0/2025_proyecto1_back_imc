import { Inject, Injectable } from '@nestjs/common';
import { CalcularImcDto } from './dto/calcular-imc-dto';
import { IImcRepository } from './IImcRepository';
import { GuardarImcDto } from './dto/guardar-imc-dto';

@Injectable()
export class ImcService {
  constructor(
    @Inject('IImcRepository') private readonly imcRepository: IImcRepository,
  ) {}
  calcularImc(data: CalcularImcDto & { userId: number }): {
    imc: number;
    categoria: string;
  } {
    const { altura, peso, userId } = data;
    // Validaciones
    if (altura <= 0) {
      throw new Error('Altura must be greater than 0');
    }
    if (peso <= 0) {
      throw new Error('Peso must be greater than 0');
    }
    const imc = peso / (altura * altura);
    const imcRedondeado = Math.round(imc * 100) / 100; // Dos decimales

    let categoria: string;
    if (imc < 18.5) {
      categoria = 'Bajo peso';
    } else if (imc < 25) {
      categoria = 'Normal';
    } else if (imc < 30) {
      categoria = 'Sobrepeso';
    } else {
      categoria = 'Obeso';
    }
    void this.guardarImc({
      altura,
      peso,
      imc: imcRedondeado,
      categoria,
      userId,
    });

    return { imc: imcRedondeado, categoria };
  }

  async guardarImc(data: GuardarImcDto): Promise<void> {
    await this.imcRepository.save(data);
  }

  async obtenerHistorialPorUsuario(userId: number): Promise<GuardarImcDto[]> {
    return this.imcRepository.findByUserId(userId);
  }
}
