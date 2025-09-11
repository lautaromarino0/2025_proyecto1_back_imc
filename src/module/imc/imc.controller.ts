import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ImcService } from './imc.service';
import { CalcularImcDto } from './dto/calcular-imc-dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('imc')
export class ImcController {
  constructor(private readonly imcService: ImcService) {}

  @UseGuards(JwtAuthGuard)
  @Post('calcular')
  calcular(
    @Body(ValidationPipe)
    data: CalcularImcDto,
    @Req()
    req,
  ) {
    // req.user.id es el usuario autenticado
    return this.imcService.calcularImc({ ...data, userId: req.user.id });
  }

  @UseGuards(JwtAuthGuard)
  @Get('historial')
  async obtenerHistorial(@Req() req) {
    // req.user viene del JwtStrategy
    return this.imcService.obtenerHistorialPorUsuario(req.user.id);
  }
}
