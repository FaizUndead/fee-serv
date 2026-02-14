import { buildServer } from './server';
import { FastifyInstance } from 'fastify';

describe('Server', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /health', () => {
    it('should return 200 status code', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
    });

    it('should return status ok', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/health'
      });

      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({ status: 'ok' });
    });
  });
});
