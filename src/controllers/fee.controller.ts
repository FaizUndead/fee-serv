import { FastifyRequest, FastifyReply } from 'fastify';
import { parseFeeCSV } from '../services/csv-parser';
import { setFeeConfig } from '../services/config-store';

export async function saveFeeConfig(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const data = await request.file();

    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const fileContent = await data.toBuffer();
    const csvText = fileContent.toString('utf-8');

    const feeConfig = parseFeeCSV(csvText);
    setFeeConfig(feeConfig);

    return reply.code(200).send({ message: 'Fee configuration updated successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return reply.code(400).send({ error: errorMessage });
  }
}
