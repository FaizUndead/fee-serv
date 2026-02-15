import { FastifyRequest, FastifyReply } from 'fastify';
import { parseFeeCSV } from '../services/csv-parser';
import { setFeeIndex, getFeeIndex } from '../services/config-store';
import { buildFeeIndex, findFeeRule } from '../services/fee-lookup';
import { calculateFee } from '../utils/fee-calculator';
import { FeeCalculationRequest, FeeCalculationResponse } from '../types/fee.types';

export async function saveFeeConfig(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const data = await request.file();

    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }

    const fileContent = await data.toBuffer();
    const csvText = fileContent.toString('utf-8');

    const feeConfig = parseFeeCSV(csvText);
    const feeIndex = buildFeeIndex(feeConfig);

    setFeeIndex(feeIndex);

    return reply.code(200).send({ message: 'Fee configuration updated successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return reply.code(400).send({ error: errorMessage });
  }
}

export async function calculateFeeHandler(
  request: FastifyRequest<{ Querystring: FeeCalculationRequest }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { total, type } = request.query;

    // Validate query parameters
    if (total === undefined || total === null) {
      return reply.code(400).send({ error: 'Missing required query parameter: total' });
    }

    if (!type) {
      return reply.code(400).send({ error: 'Missing required query parameter: type' });
    }

    const totalNum = typeof total === 'string' ? parseFloat(total) : total;

    if (isNaN(totalNum) || totalNum < 0) {
      return reply.code(400).send({ error: 'Total must be a non-negative number' });
    }

    // Get fee index
    const index = getFeeIndex();
    if (!index) {
      return reply.code(400).send({ error: 'Fee configuration not loaded. Please upload a fee configuration first.' });
    }

    // Find matching rule
    const rule = findFeeRule(type, totalNum, index);
    if (!rule) {
      return reply.code(404).send({ error: `No fee rule found for type "${type}" and total ${totalNum}` });
    }

    // Calculate fee
    const feeAmount = calculateFee(totalNum, rule.percentage);
    const response: FeeCalculationResponse = {
      total: totalNum + feeAmount,
      type,
      percentage: rule.percentage,
      feeAmount
    };

    return reply.code(200).send(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return reply.code(500).send({ error: errorMessage });
  }
}
