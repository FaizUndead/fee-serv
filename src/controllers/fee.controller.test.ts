import { buildServer } from '../server';
import { FastifyInstance } from 'fastify';
import { getFeeIndex } from '../services/config-store';
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

    it('should return 200 and store index with valid CSV file', async () => {
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
      const index = getFeeIndex();
      expect(index).toBeDefined();
      expect(index?.size).toBe(2); // clearing and transfer
      expect(index?.get('clearing')).toHaveLength(2);
      expect(index?.get('transfer')).toHaveLength(1);
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

  describe('GET /fee', () => {
    beforeEach(async () => {
      // Upload CSV to setup fee index
      const validCSV = `Fee Type,From,To,Percentage
clearing,0,5002,0.0379
clearing,5003,10001,0.0248
transfer,0,5002,0.013
transfer,5003,10001,0.0222`;

      const form = new FormData();
      form.append('file', Buffer.from(validCSV), {
        filename: 'fees.csv',
        contentType: 'text/csv'
      });

      await server.inject({
        method: 'POST',
        url: '/fee',
        headers: form.getHeaders(),
        payload: form
      });
    });

    it('should calculate fee for valid request', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/fee?total=1000&type=clearing'
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.total).toBeCloseTo(1037.9, 2);
      expect(result.type).toBe('clearing');
      expect(result.percentage).toBe(0.0379);
      expect(result.feeAmount).toBeCloseTo(37.9, 2);
    });

    it('should calculate fee for different range', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/fee?total=7500&type=transfer'
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.total).toBeCloseTo(7666.5, 2);
      expect(result.type).toBe('transfer');
      expect(result.percentage).toBe(0.0222);
      expect(result.feeAmount).toBeCloseTo(166.5, 2);
    });

    it('should return 400 when total is missing', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/fee?type=clearing'
      });

      expect(response.statusCode).toBe(400);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });

    it('should return 400 when type is missing', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/fee?total=1000'
      });

      expect(response.statusCode).toBe(400);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });

    it('should return 400 when total is negative', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/fee?total=-100&type=clearing'
      });

      expect(response.statusCode).toBe(400);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });

    it('should return 404 when no matching rule is found', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/fee?total=20000&type=clearing'
      });

      expect(response.statusCode).toBe(404);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });

    it('should return 404 for unknown fee type', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/fee?total=1000&type=unknown'
      });

      expect(response.statusCode).toBe(404);
      const result = JSON.parse(response.payload);
      expect(result).toHaveProperty('error');
    });
  });
});
