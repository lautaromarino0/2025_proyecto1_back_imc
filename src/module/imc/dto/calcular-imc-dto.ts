import { IsNumber, Max, Min } from 'class-validator';

export class CalcularImcDto {
  @IsNumber()
  @Min(0.01, { message: 'La altura debe ser mayor a 0' }) // Altura mínima razonable
  @Max(3, { message: 'La altura no puede ser mayor a 3 metros' }) // Altura máxima razonable
  altura: number;

  @IsNumber()
  @Min(0.01, { message: 'El peso debe ser mayor a 0' }) // Peso mínimo razonable
  @Max(500, { message: 'El peso no puede ser mayor a 500 kg' }) // Peso máximo razonable
  peso: number;
}
