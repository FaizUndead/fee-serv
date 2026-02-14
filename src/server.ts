import fastify, { FastifyInstance } from 'fastify';

export async function buildServer(): Promise<FastifyInstance> {
  const server = fastify({
    logger: true
  });

  server.get('/health', async (_request, reply) => {
    return reply.code(200).send({ status: 'ok' });
  });

  return server;
}
