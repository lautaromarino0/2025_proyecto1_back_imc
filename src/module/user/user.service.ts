import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './UserRepository';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.userRepository.create(createUserDto);
  }
  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  findById(id: number) {
    return this.userRepository.findById(id);
  }
}
