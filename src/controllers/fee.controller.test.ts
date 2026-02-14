import { buildServer } from '../server';
import { FastifyInstance } from 'fastify';
import { getFeeConfig } from '../services/config-store';
import FormData from 'form-data';

describe('Fee Controller', () => {
  let server: FastifyInstance;

  beforeAll(async () => {
    server = await buildServer();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('POST /fee', () => {
    const validCSV = `Fee Type,From,To,Percentage
clearing,0,5002,0.0379
clearing,5003,10001,0.0248
transfer,0,5002,0.013`;

    it('should return 200 and store config with valid CSV file', async () => {
      const form = new FormData();
      form.append('file', Buffer.from(validCSV), {
        filename: 'fees.csv',
        contentType: 'text/csv'
      });

      const response = await server.inject({
        method: 'POST',
        url: '/fee',
        headers: form.getHeaders(),
        payload: form
      });

      expect(response.statusCode).toBe(200);
      const config = getFeeConfig();
      expect(config).toBeDefined();
      expect(config).toHaveLength(3);
    });

    it('should return 400 when CSV parsing fails', async () => {
      const invalidCSV = `Invalid,Headers
clearing,0,5002,0.0379`;

      const form = new FormData();
      form.append('file', Buffer.from(invalidCSV), {
        filename: 'fees.csv',
        contentType: 'text/csv'
      });

      const response = await server.inject({
        method: 'POST',
        url: '/fee',
        headers: form.getHeaders(),
        payload: form
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload).toHaveProperty('error');
    });

    it('should return 400 when no file is provided', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/fee'
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
