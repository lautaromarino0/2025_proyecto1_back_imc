import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';

export interface IUserRepository {
  create(data: CreateUserDto): Promise<void>;
  findByEmail(email: string): Promise<UserDto | null>;
}
