import { parse } from 'csv-parse/sync';
import { FeeConfig } from '../types/fee.types';

const EXPECTED_HEADERS = ['Fee Type', 'From', 'To', 'Percentage'];

interface CSVRecord {
  'Fee Type': string;
  'From': string;
  'To': string;
  'Percentage': string;
}

export function parseFeeCSV(csvContent: string): FeeConfig {
  if (!csvContent || csvContent.trim() === '') {
    throw new Error('CSV content is empty');
  }

  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as CSVRecord[];

  // Validate headers
  if (records.length > 0) {
    const firstRecord = records[0];
    const actualHeaders = Object.keys(firstRecord);

    const headersMatch = EXPECTED_HEADERS.every((header, index) =>
      actualHeaders[index] === header
    );

    if (!headersMatch || actualHeaders.length !== EXPECTED_HEADERS.length) {
      throw new Error('Invalid CSV headers. Expected: Fee Type,From,To,Percentage');
    }
  }

  const feeConfig: FeeConfig = [];

  for (const record of records) {
    const feeType = record['Fee Type'];
    const fromStr = record['From'];
    const toStr = record['To'];
    const percentageStr = record['Percentage'];

    // Check for missing columns
    if (!feeType || fromStr === undefined || toStr === undefined || percentageStr === undefined) {
      throw new Error('Invalid row: missing columns');
    }

    // Parse numbers
    const from = parseFloat(fromStr);
    const to = parseFloat(toStr);
    const percentage = parseFloat(percentageStr);

    // Validate numbers
    if (isNaN(from) || isNaN(to) || isNaN(percentage)) {
      throw new Error('Invalid number format in CSV');
    }

    // Validate percentage range
    if (percentage < 0 || percentage > 1) {
      throw new Error('Percentage must be between 0 and 1');
    }

    feeConfig.push({
      feeType,
      from,
      to,
      percentage
    });
  }

  return feeConfig;
}
