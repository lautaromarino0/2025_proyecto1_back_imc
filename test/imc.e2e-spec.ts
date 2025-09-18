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
import * as bcrypt from 'bcryptjs';

describe('IMC Integration Tests', () => {
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
    // Limpiar base de datos
    await imcRepository.query('DELETE FROM imc');
    await userRepository.query('DELETE FROM "user"');

    // Registrar usuario de prueba usando la API
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'imctest@example.com',
        password: 'testpassword',
      })
      .expect(201);

    // Obtener el usuario creado para los tests
    testUser = (await userRepository.findOne({
      where: { email: 'imctest@example.com' },
    })) as User;

    // Autenticar usuario
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'imctest@example.com',
        password: 'testpassword',
      })
      .expect(201);

    jwtToken = loginResponse.body.access_token;
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

  describe('POST /imc/calcular', () => {
    it('should calculate and save IMC correctly', async () => {
      const calculateImcDto = {
        peso: 70,
        altura: 1.75,
      };

      const response = await request(app.getHttpServer())
        .post('/imc/calcular')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(calculateImcDto)
        .expect(201);

      // Verificar cálculo de IMC (70 / (1.75^2) = 22.86)
      expect(response.body).toHaveProperty('imc');
      expect(response.body.imc).toBeCloseTo(22.86, 2);
      expect(response.body).toHaveProperty('categoria');
      expect(response.body.categoria).toBe('Normal');

      // Verificar que se guardó en la base de datos
      const savedImc = await imcRepository.findOne({
        where: { user: { id: testUser.id } },
      });
      expect(savedImc).toBeDefined();
      expect(savedImc!.peso).toBe(70);
      expect(savedImc!.altura).toBe(1.75);
      expect(savedImc!.imc).toBeCloseTo(22.86, 2);
    });

    it('should calculate different IMC categories correctly', async () => {
      const testCases = [
        { peso: 50, altura: 1.75, expectedCategory: 'Bajo peso' },
        { peso: 70, altura: 1.75, expectedCategory: 'Normal' },
        { peso: 90, altura: 1.75, expectedCategory: 'Sobrepeso' },
        { peso: 110, altura: 1.75, expectedCategory: 'Obeso' },
      ];

      for (const testCase of testCases) {
        const response = await request(app.getHttpServer())
          .post('/imc/calcular')
          .set('Authorization', `Bearer ${jwtToken}`)
          .send({ peso: testCase.peso, altura: testCase.altura })
          .expect(201);

        expect(response.body.categoria).toBe(testCase.expectedCategory);
      }
    });

    it('should require authentication', async () => {
      const calculateImcDto = {
        peso: 70,
        altura: 1.75,
      };

      await request(app.getHttpServer())
        .post('/imc/calcular')
        .send(calculateImcDto)
        .expect(401);
    });

    it('should validate required fields', async () => {
      // Sin peso
      await request(app.getHttpServer())
        .post('/imc/calcular')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ altura: 1.75 })
        .expect(400);

      // Sin altura
      await request(app.getHttpServer())
        .post('/imc/calcular')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ peso: 70 })
        .expect(400);

      // Valores inválidos
      await request(app.getHttpServer())
        .post('/imc/calcular')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ peso: -10, altura: 1.75 })
        .expect(400);

      await request(app.getHttpServer())
        .post('/imc/calcular')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({ peso: 70, altura: 0 })
        .expect(400);
    });
  });

  describe('GET /imc/historial', () => {
    beforeEach(async () => {
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
      ];

      await imcRepository.save(imcData);
    });

    it('should return user IMC history', async () => {
      const response = await request(app.getHttpServer())
        .get('/imc/historial')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('peso');
      expect(response.body[0]).toHaveProperty('altura');
      expect(response.body[0]).toHaveProperty('imc');
      expect(response.body[0]).toHaveProperty('categoria');
      expect(response.body[0]).toHaveProperty('fecha');
      expect(response.body[0]).toHaveProperty('userId');
    });

    it('should return history ordered by date (most recent first)', async () => {
      const response = await request(app.getHttpServer())
        .get('/imc/historial')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      // Verificar que están ordenados por fecha descendente
      for (let i = 0; i < response.body.length - 1; i++) {
        const currentDate = new Date(response.body[i].fecha);
        const nextDate = new Date(response.body[i + 1].fecha);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(
          nextDate.getTime(),
        );
      }
    });

    it('should only return data for authenticated user', async () => {
      // Crear otro usuario con datos diferentes
      const hashedPassword = await bcrypt.hash('otherpassword', 10);
      const otherUser = await userRepository.save({
        email: 'other@example.com',
        password: hashedPassword,
      });

      // Insertar datos para el otro usuario
      await imcRepository.save({
        peso: 90,
        altura: 1.8,
        imc: 27.78,
        categoria: 'Sobrepeso',
        user: otherUser,
      });

      const response = await request(app.getHttpServer())
        .get('/imc/historial')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      // Debe devolver solo los datos del usuario actual (3 registros)
      expect(response.body).toHaveLength(3);
      // Verificar que todos los registros pertenecen al usuario actual
      response.body.forEach((record) => {
        expect(record.userId).toBe(testUser.id);
      });
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer()).get('/imc/historial').expect(401);
    });

    it('should return empty array for user with no IMC data', async () => {
      // Limpiar datos del usuario actual
      await imcRepository.query('DELETE FROM imc WHERE "userId" = $1', [
        testUser.id,
      ]);

      const response = await request(app.getHttpServer())
        .get('/imc/historial')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe('IMC Business Logic Tests', () => {
    it('should maintain data consistency between calculate and history', async () => {
      const calculateImcDto = {
        peso: 68,
        altura: 1.7,
      };

      // Calcular IMC
      const calculateResponse = await request(app.getHttpServer())
        .post('/imc/calcular')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(calculateImcDto)
        .expect(201);

      // Obtener historial
      const historyResponse = await request(app.getHttpServer())
        .get('/imc/historial')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200);

      // El último registro del historial debe coincidir con el cálculo
      const latestRecord = historyResponse.body[0];
      // Comparar con la respuesta del cálculo (solo imc y categoría)
      expect(latestRecord.imc).toBeCloseTo(calculateResponse.body.imc, 2);
      expect(latestRecord.categoria).toBe(calculateResponse.body.categoria);
    });
  });
});
