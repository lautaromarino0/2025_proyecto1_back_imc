import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
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

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call create on repository', async () => {
    const repo = (service as any).userRepository;
    await service.create({ email: 'test@mail.com', password: '123456' });
    expect(repo.create).toHaveBeenCalledWith({ email: 'test@mail.com', password: '123456' });
  });

  it('should call findByEmail on repository', async () => {
    const repo = (service as any).userRepository;
    await service.findByEmail('test@mail.com');
    expect(repo.findByEmail).toHaveBeenCalledWith('test@mail.com');
  });

  it('should call findById on repository', async () => {
    const repo = (service as any).userRepository;
    await service.findById(1);
    expect(repo.findById).toHaveBeenCalledWith(1);
  });
});
