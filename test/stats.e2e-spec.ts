/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/module/user/entities/user.entity';
import { Imc } from '../src/module/imc/entities/imc.entity';

describe('Stats Integration Tests', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let imcRepository: Repository<Imc>;
  let jwtToken: string;
  let testUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    imcRepository = moduleFixture.get<Repository<Imc>>(getRepositoryToken(Imc));
  });

  beforeEach(async () => {
    // Limpiar base de datos usando queries SQL directas
    await imcRepository.query('DELETE FROM imc');
    await userRepository.query('DELETE FROM "user"');

    // Registrar usuario usando el endpoint de auth
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'testpassword',
      })
      .expect(201);

    // Obtener el usuario creado por el registro
    testUser = (await userRepository.findOne({
      where: { email: 'test@example.com' },
    }))!;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword',
      })
      .expect(201);

    jwtToken = loginResponse.body.access_token;

    // Verificar que el usuario existe antes de insertar IMC
    if (testUser) {
      // Insertar datos de IMC de prueba
      const imcData = [
        {
          peso: 70,
          altura: 1.75,
          imc: 22.86,
          categoria: 'Normal',
          user: testUser,
        },
        {
          peso: 72,
          altura: 1.75,
          imc: 23.51,
          categoria: 'Normal',
          user: testUser,
        },
        {
          peso: 75,
          altura: 1.75,
          imc: 24.49,
          categoria: 'Normal',
          user: testUser,
        },
        {
          peso: 80,
          altura: 1.75,
          imc: 26.12,
          categoria: 'Sobrepeso',
          user: testUser,
        },
      ];

      await imcRepository.save(imcData);
    }
  });

  afterEach(async () => {
    // Limpieza adicional después de cada test
    try {
      await imcRepository.query('DELETE FROM imc');
      await userRepository.query('DELETE FROM "user"');
    } catch {
      // Ignorar errores de limpieza
    }
  });

  afterAll(async () => {
    // Limpieza final
    try {
      await imcRepository.query('DELETE FROM imc');
      await userRepository.query('DELETE FROM "user"');
    } catch {
      // Ignorar errores de limpieza
    }
    await app.close();
  });

  describe('GET /stats/imc-evolucion', () => {
    it('should return IMC evolution data for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/stats/imc-evolucion')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveLength(4);
      expect(response.body[0]).toHaveProperty('imc');
      expect(response.body[0]).toHaveProperty('fecha');
      expect(response.body[0].imc).toBe(22.86);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/stats/imc-evolucion')
        .expect(401);
    });

    it('should return empty array for user with no IMC data', async () => {
      // Registrar otro usuario sin datos IMC usando la API
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test2@example.com',
          password: 'testpassword2',
        })
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test2@example.com',
          password: 'testpassword2',
        })
        .expect(201);

      const newToken = loginResponse.body.access_token;

      const response = await request(app.getHttpServer())
        .get('/stats/imc-evolucion')
        .set('Authorization', `Bearer ${newToken}`)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /stats/peso-evolucion', () => {
    it('should return weight evolution data for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/stats/peso-evolucion')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveLength(4);
      expect(response.body[0]).toHaveProperty('peso');
      expect(response.body[0]).toHaveProperty('fecha');
      expect(response.body[0].peso).toBe(70);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get('/stats/peso-evolucion')
        .expect(401);
    });
  });

  describe('GET /stats/metricas', () => {
    it('should return aggregated metrics for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/stats/metricas')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('imcPromedio');
      expect(response.body).toHaveProperty('imcDesviacion');
      expect(response.body).toHaveProperty('pesoPromedio');
      expect(response.body).toHaveProperty('pesoDesviacion');
      expect(response.body).toHaveProperty('categorias');

      // Verificar cálculos
      expect(response.body.imcPromedio).toBeCloseTo(24.245, 2);
      expect(response.body.pesoPromedio).toBeCloseTo(74.25, 2);
      // Verificar categorias como array
      const normalCategory = response.body.categorias.find(
        (c) => c.categoria === 'Normal',
      );
      const sobrepesoCategory = response.body.categorias.find(
        (c) => c.categoria === 'Sobrepeso',
      );
      expect(normalCategory.cantidad).toBe('3');
      expect(sobrepesoCategory.cantidad).toBe('1');
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer()).get('/stats/metricas').expect(401);
    });

    it('should only return data for authenticated user', async () => {
      // Registrar otro usuario con diferentes datos usando la API
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'other@example.com',
          password: 'testpassword2',
        })
        .expect(201);

      // Obtener el usuario creado
      const otherUser = (await userRepository.findOne({
        where: { email: 'other@example.com' },
      })) as User;

      // Insertar datos diferentes para el otro usuario
      await imcRepository.save({
        peso: 90,
        altura: 1.8,
        imc: 27.78,
        categoria: 'Sobrepeso',
        user: otherUser,
      });

      // Verificar que el usuario original solo ve sus datos
      const response = await request(app.getHttpServer())
        .get('/stats/metricas')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      // Los promedios deben seguir siendo los del usuario original
      expect(response.body.imcPromedio).toBeCloseTo(24.245, 2);
      expect(response.body.pesoPromedio).toBeCloseTo(74.25, 2);
    });
  });

  describe('Authorization Tests', () => {
    it('should require valid JWT token for all endpoints', async () => {
      const endpoints = [
        '/stats/imc-evolucion',
        '/stats/peso-evolucion',
        '/stats/metricas',
      ];

      for (const endpoint of endpoints) {
        await request(app.getHttpServer()).get(endpoint).expect(401);

        await request(app.getHttpServer())
          .get(endpoint)
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      }
    });
  });
});
