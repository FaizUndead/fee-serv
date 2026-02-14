import fastify, { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { saveFeeConfig } from './controllers/fee.controller';

export async function buildServer(): Promise<FastifyInstance> {
  const server = fastify({
    logger: true
  });

  await server.register(multipart);

  server.get('/health', async (_request, reply) => {
    return reply.code(200).send({ status: 'ok' });
  });

  server.post('/fee', saveFeeConfig);

  return server;
}
