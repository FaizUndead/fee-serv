# Fee Server

A Node.js server built with Fastify and TypeScript for managing fee configurations via CSV file uploads.

## Features

- RESTful API with Fastify
- Strict TypeScript configuration
- CSV file upload and parsing
- In-memory fee configuration storage
- Comprehensive test coverage with Jest
- TDD approach with separated concerns

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Fastify 5.x
- **Language**: TypeScript 5.x with strict mode
- **Testing**: Jest with ts-jest
- **CSV Parsing**: csv-parse
- **File Upload**: @fastify/multipart

## Installation

```bash
npm install
```

## Usage

### Development

Start the development server with hot reload:

```bash
npm run dev
```

Server will run on `http://localhost:3000`

### Production

Build and run the production server:

```bash
npm run build
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Endpoints

### GET /health

Health check endpoint.

**Response**: `200 OK`

```json
{
  "status": "ok"
}
```

### POST /fee

Upload a CSV file to configure fee rules.

**Content-Type**: `multipart/form-data`

**Request**: Upload a CSV file with the following format:

```csv
Fee Type,From,To,Percentage
clearing,0,5002,0.0379
clearing,5003,10001,0.0248
transfer,0,5002,0.013
transfer,5003,10001,0.0222
```

**CSV Format Requirements**:
- Headers must be exactly: `Fee Type,From,To,Percentage`
- `Fee Type`: String (e.g., "clearing", "transfer")
- `From`: Non-negative number (range start)
- `To`: Non-negative number (range end)
- `Percentage`: Number between 0 and 1 (e.g., 0.0379 for 3.79%)

**Success Response**: `200 OK`

```json
{
  "message": "Fee configuration updated successfully"
}
```

**Error Response**: `400 Bad Request`

```json
{
  "error": "Error message describing the issue"
}
```

**Possible Errors**:
- No file uploaded
- Invalid CSV headers
- Missing columns in CSV rows
- Invalid number formats
- Percentage outside range [0, 1]

## Project Structure

```
fee-server/
├── src/
│   ├── controllers/
│   │   ├── fee.controller.ts          # POST /fee endpoint logic
│   │   └── fee.controller.test.ts     # Controller tests
│   ├── services/
│   │   ├── csv-parser.ts              # CSV parsing and validation
│   │   ├── csv-parser.test.ts         # CSV parser tests
│   │   ├── config-store.ts            # In-memory config storage
│   │   └── config-store.test.ts       # Config store tests
│   ├── types/
│   │   └── fee.types.ts               # TypeScript type definitions
│   ├── server.ts                      # Fastify server setup
│   ├── server.test.ts                 # Server tests
│   └── index.ts                       # Application entry point
├── dist/                              # Compiled JavaScript output
├── coverage/                          # Test coverage reports
├── jest.config.js                     # Jest configuration
├── tsconfig.json                      # TypeScript configuration
└── package.json                       # Project dependencies
```

## Development

This project follows TDD (Test-Driven Development) principles:

1. Write tests first
2. Implement minimal code to pass tests
3. Refactor while keeping tests green

All business logic is separated into services with comprehensive unit tests. Controllers are thin layers that orchestrate service calls.

## License

ISC
