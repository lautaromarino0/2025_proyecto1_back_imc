import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(data: CreateUserDto): Promise<void> {
    try {
      const user = this.userRepository.create(data);
      await this.userRepository.save(user);
    } catch {
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      return user
        ? { email: user.email, password: user.password, id: user.id }
        : null;
    } catch {
      throw new InternalServerErrorException('Error finding user by email');
    }
  }

  async findById(id: number): Promise<UserDto | null> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      return user
        ? { email: user.email, password: user.password, id: user.id }
        : null;
    } catch {
      throw new InternalServerErrorException('Error finding user by id');
    }
  }
}
