import { GuardarImcDto } from './dto/guardar-imc-dto';

export interface IImcRepository {
  save(imcData: GuardarImcDto): Promise<void>;
  findByUserId(userId: number): Promise<GuardarImcDto[]>;
}
