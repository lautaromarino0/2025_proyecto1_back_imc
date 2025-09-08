import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { LoginDto } from './dto/login-dto';
import { RegisterDto } from './dto/register-dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const checkPassword = await compare(password, user.password);
    if (!checkPassword) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    const { email } = registerDto;
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }
    const { password } = registerDto;
    const plainToHash: string = await hash(password, 10);
    await this.userService.create({ email, password: plainToHash });
    return { message: 'User registered successfully' };
  }
}
