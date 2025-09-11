import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        JwtService,
        {
          provide: 'IUserRepository',
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should login with correct credentials', async () => {
    const userService = (service as any).userService;
    const jwtService = (service as any).jwtService;
    userService.findByEmail.mockResolvedValue({ id: 1, email: 'test@mail.com', password: 'hashed' });
    jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(true);
    jwtService.sign = jest.fn().mockReturnValue('token');
    const result = await service.login({ email: 'test@mail.com', password: '123456' });
    expect(result).toEqual({ access_token: 'token' });
  });

  it('should throw if user not found on login', async () => {
    const userService = (service as any).userService;
    userService.findByEmail.mockResolvedValue(null);
    await expect(service.login({ email: 'notfound@mail.com', password: '123456' }))
      .rejects.toThrow('User not found');
  });

  it('should throw if password is invalid', async () => {
    const userService = (service as any).userService;
    userService.findByEmail.mockResolvedValue({ id: 1, email: 'test@mail.com', password: 'hashed' });
    jest.spyOn(require('bcryptjs'), 'compare').mockResolvedValue(false);
    await expect(service.login({ email: 'test@mail.com', password: 'wrong' }))
      .rejects.toThrow('Invalid credentials');
  });

  it('should register a new user', async () => {
    const userService = (service as any).userService;
    userService.findByEmail.mockResolvedValue(null);
    userService.create.mockResolvedValue(undefined);
    jest.spyOn(require('bcryptjs'), 'hash').mockResolvedValue('hashed');
    const result = await service.register({ email: 'new@mail.com', password: '123456' });
    expect(result).toEqual({ message: 'User registered successfully' });
    expect(userService.create).toHaveBeenCalledWith({ email: 'new@mail.com', password: 'hashed' });
  });

  it('should throw if user already exists on register', async () => {
    const userService = (service as any).userService;
    userService.findByEmail.mockResolvedValue({ id: 1, email: 'test@mail.com', password: 'hashed' });
    await expect(service.register({ email: 'test@mail.com', password: '123456' }))
      .rejects.toThrow('User already exists');
  });
});
