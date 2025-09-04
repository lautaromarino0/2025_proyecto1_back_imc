import { Injectable } from '@nestjs/common';
import { CalcularImcDto } from './dto/calcular-imc-dto';

@Injectable()
export class ImcService {
  calcularImc(data: CalcularImcDto): { imc: number; categoria: string } {
    const { altura, peso } = data;
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

    return { imc: imcRedondeado, categoria };
  }
}
