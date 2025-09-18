/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/module/user/entities/user.entity';

describe('Auth Integration Tests', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  beforeEach(async () => {
    // Limpiar base de datos
    await userRepository.query('DELETE FROM "user"');
  });

  afterEach(async () => {
    // Limpieza adicional después de cada test
    try {
      await userRepository.query('DELETE FROM "user"');
    } catch {
      // Ignorar errores de limpieza
    }
  });

  afterAll(async () => {
    // Limpieza final
    try {
      await userRepository.query('DELETE FROM "user"');
    } catch {
      // Ignorar errores de limpieza
    }
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // El registro devuelve un mensaje de éxito
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('User registered successfully');

      // Verificar que el usuario se guardó en la base de datos
      const savedUser = await userRepository.findOne({
        where: { email: registerDto.email },
      });
      expect(savedUser).toBeDefined();
      expect(savedUser!.email).toBe(registerDto.email);
    });

    it('should not register user with duplicate email', async () => {
      const registerDto = {
        email: 'duplicate@example.com',
        password: 'password123',
      };

      // Registrar el primer usuario
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      // Intentar registrar el mismo email - devuelve 409 Conflict
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);
    });

    it('should handle validation errors', async () => {
      // Sin password - ahora debería devolver 400 por validación
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      // Email inválido - ahora debería devolver 400 por validación de formato
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'invalid-email', password: 'password123' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Registrar usuario de prueba usando la API
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'login@example.com',
          password: 'testpassword',
        })
        .expect(201);
    });

    it('should login with valid credentials', async () => {
      const loginDto = {
        email: 'login@example.com',
        password: 'testpassword',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
      expect(response.body.access_token.length).toBeGreaterThan(0);
    });

    it('should not login with invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'testpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(404); // User not found
    });

    it('should not login with invalid password', async () => {
      const loginDto = {
        email: 'login@example.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('should handle missing fields in login', async () => {
      // Sin email - ahora debería devolver 400 por validación
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ password: 'testpassword' })
        .expect(400);

      // Sin password - ahora debería devolver 400 por validación
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'login@example.com' })
        .expect(400);
    });

    it('should return valid JWT token that can be used for authentication', async () => {
      const loginDto = {
        email: 'login@example.com',
        password: 'testpassword',
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201);

      const token = loginResponse.body.access_token;

      // Usar el token para acceder a un endpoint protegido
      await request(app.getHttpServer())
        .get('/imc/historial')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });
  });
});
