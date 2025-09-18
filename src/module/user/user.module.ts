import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './UserRepository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [],
  providers: [
    UserService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
  ],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
