# Fee Server - Technical Context

## Project Overview

This is a TypeScript-based Node.js server built with Fastify for managing fee configurations. The server accepts CSV file uploads containing fee rules, validates them, and stores them in-memory for use by other application logic.

## Architecture & Design Decisions

### TDD Approach

The entire project was built using Test-Driven Development:
1. Types and interfaces defined first
2. Tests written before implementation
3. Implementation created to make tests pass
4. Code refactored while maintaining green tests

This approach ensured:
- High test coverage (42 tests across 6 test suites)
- Clear specification of behavior before coding
- Confidence in refactoring

### Separation of Concerns

**Controllers** (`src/controllers/`)
- Thin layer handling HTTP request/response
- Orchestrates service calls
- Handles error responses and status codes
- No business logic

**Services** (`src/services/`)
- `csv-parser.ts`: Validates and parses CSV content into typed config
- `config-store.ts`: Simple in-memory storage for indexed fee configuration
- `fee-lookup.ts`: Stateless service for building index and finding fee rules using binary search
- Pure business logic with no HTTP concerns
- Independently testable

**Utilities** (`src/utils/`)
- `fee-calculator.ts`: Pure function for fee calculation (total × percentage)

**Types** (`src/types/`)
- `FeeRule`: Single fee rule with feeType, from, to, percentage
- `FeeConfig`: Array of FeeRule objects
- `FeeIndex`: Map<feeType, sorted FeeRule[]> for efficient lookups
- `FeeCalculationRequest`: Request params for GET /fee
- `FeeCalculationResponse`: Response structure with calculated fee
- Shared across all layers

### Technology Choices

**Fastify**
- Chosen for performance and TypeScript-first design
- Plugin architecture (@fastify/multipart for file uploads)
- Built-in validation and serialization support

**csv-parse**
- Robust CSV parsing with synchronous API
- Column-based parsing for easy validation
- Handles edge cases and malformed data

**TypeScript Strict Mode**
- All strict flags enabled in tsconfig.json
- Catches errors at compile time
- Better IDE support and refactoring confidence

**Jest with ts-jest**
- Standard testing framework for TypeScript
- Fast test execution
- Good mocking and assertion capabilities

## Current Implementation Status

### Completed Features

✅ Project setup with TypeScript, Jest, Fastify
✅ Health check endpoint (GET /health)
✅ CSV parser with validation (11 test cases)
  - Header validation
  - Data type validation
  - Range validation (percentage 0-1)
  - Error handling
✅ In-memory config store (3 test cases)
  - Set and get operations for FeeIndex
  - Index overwriting
✅ Fee lookup service with binary search (10 test cases)
  - Build indexed Map grouped by fee type
  - Binary search on sorted ranges
  - O(log n) lookup complexity
✅ Fee calculator utility (6 test cases)
  - Pure function for percentage-based calculation
✅ File upload endpoint (POST /fee - 3 test cases)
  - Multipart file handling
  - CSV parsing integration
  - Index building and storage
  - Error responses
✅ Fee calculation endpoint (GET /fee - 7 test cases)
  - Query parameter validation
  - Fee rule lookup using binary search
  - Fee calculation and response formatting
  - Error handling (missing params, no config, no matching rule)
✅ Comprehensive test suite (42 total tests across 6 test suites)
✅ Documentation (README.md, .claudemd)

### Architecture Highlights

**Efficient Fee Lookup Algorithm**:
- CSV upload: Builds `Map<feeType, sorted FeeRule[]>` index (O(n log n))
- Fee calculation: Binary search within fee type group (O(log n))
- Space complexity: O(n) for indexed storage

**Clean Architecture**:
- Stateless services (fee-lookup)
- Pure functions (fee-calculator)
- Dumb storage (config-store)
- Orchestration in controllers

### Not Yet Implemented

- Data persistence (currently in-memory only)
- Authentication/authorization
- Rate limiting
- Request validation schemas (using Fastify schemas)
- Structured logging improvements
- Error monitoring (Sentry, etc.)
- Horizontal scaling considerations

## Code Organization Patterns

### File Naming
- `*.ts` - Implementation files
- `*.test.ts` - Test files (colocated with implementation)
- `*.types.ts` - Type definition files

### Test Organization
- Each service/controller/utility has its own test file
- Tests are colocated with the code they test
- Server-level tests (2 tests): routing and health endpoint
- Controller tests (10 tests): HTTP integration for POST and GET endpoints
- Service tests (21 tests): CSV parsing, config storage, fee lookup
- Utility tests (6 tests): fee calculation logic
- Integration tests use beforeEach to setup shared state (e.g., uploading CSV before testing GET /fee)

### Import Strategy
- Relative imports within the same module
- Absolute imports avoided (project is small enough)
- Types imported from dedicated type files

## Memory Considerations

The config store uses a simple module-level variable for the indexed fee structure:
```typescript
let feeIndex: FeeIndex | undefined; // Map<feeType, sorted FeeRule[]>
```

**Implications**:
- Index is lost on server restart (must re-upload CSV)
- Not suitable for multi-instance deployments without external storage
- Fast read/write with no I/O overhead
- O(log n) lookup performance via binary search
- Good for prototyping and development

**Design Decision**:
- Only stores the indexed `FeeIndex`, not the raw `FeeConfig`
- The raw CSV data is transformed immediately into the optimized lookup structure
- Reduces memory footprint and eliminates redundant storage

**Future Options**:
- Add Redis for shared in-memory storage across instances
- Add database persistence (PostgreSQL, MongoDB)
- Add file-based persistence as fallback
- Consider write-through cache pattern for database-backed storage

## Testing Strategy

### Unit Tests (Services & Utilities)
- csv-parser: 11 tests covering parsing, validation, edge cases
- config-store: 3 tests covering get/set/overwrite operations for FeeIndex
- fee-lookup: 10 tests covering index building and binary search logic
- fee-calculator: 6 tests covering calculation logic with various inputs
- Isolated from HTTP layer and file I/O

### Integration Tests (Controllers)
- fee.controller: 10 tests (3 for POST /fee, 7 for GET /fee)
- Tests actual HTTP requests using Fastify's inject method
- Verifies end-to-end flow without network calls
- beforeEach hooks ensure proper test setup (e.g., uploading CSV before testing GET)

### Server Tests
- 2 tests for health endpoint
- Minimal coverage as routing is handled by Fastify

### Test Utilities
- FormData used for multipart file upload testing
- Fastify inject() for HTTP testing without starting server
- Test isolation maintained (each test suite has own server instance)
- Query string testing for GET /fee endpoint

## Development Workflow

1. **Start development server**: `npm run dev`
   - Uses ts-node-dev for hot reload
   - Automatic restart on file changes

2. **Run tests during development**: `npm run test:watch`
   - Jest watch mode
   - Re-runs tests on file changes

3. **Build for production**: `npm run build`
   - Compiles TypeScript to JavaScript in `dist/`
   - Type checking and compilation errors caught

4. **Run production build**: `npm start`
   - Runs compiled JavaScript from `dist/`

## Future Considerations

### Scalability
- Move config storage to Redis or database
- Add caching layer for fee calculations (though binary search is already very fast)
- Consider horizontal scaling with load balancer
- Add config version management for rolling updates

### Observability
- Structured logging with pino (already included via Fastify)
- Error tracking (Sentry, Datadog)
- Metrics and monitoring
- Health check improvements (check config loaded, etc.)

### Security
- Add authentication (JWT, API keys)
- Add authorization (role-based access)
- Rate limiting on upload endpoint
- File size limits and validation
- CSV injection prevention

### Data Validation
- Consider using Fastify schemas for request validation
- Add Zod or similar for runtime type validation
- More comprehensive CSV validation (range overlaps, gaps, etc.)

## Key Files to Know

- `src/server.ts` - Server setup, plugin registration, route definitions (GET /health, POST /fee, GET /fee)
- `src/controllers/fee.controller.ts` - POST /fee (CSV upload) and GET /fee (fee calculation) endpoints
- `src/services/csv-parser.ts` - CSV validation and parsing logic
- `src/services/fee-lookup.ts` - Index building and binary search implementation
- `src/services/config-store.ts` - In-memory FeeIndex storage
- `src/utils/fee-calculator.ts` - Pure fee calculation function
- `src/types/fee.types.ts` - Core type definitions (FeeRule, FeeConfig, FeeIndex, request/response types)
- `jest.config.js` - Test configuration
- `tsconfig.json` - TypeScript compiler configuration

## API Flow

### Upload Flow (POST /fee)
1. Client uploads CSV file
2. Controller receives multipart file
3. CSV parser validates and parses to FeeConfig
4. Fee lookup service builds FeeIndex (groups by type, sorts by range)
5. Config store saves FeeIndex to memory
6. Returns success message

### Calculation Flow (GET /fee)
1. Client sends query params (?total=1000&type=clearing)
2. Controller validates params (required, non-negative total)
3. Config store retrieves FeeIndex
4. Fee lookup service performs binary search for matching rule
5. Fee calculator computes fee amount (total × percentage)
6. Returns response with total + fee, type, percentage, and fee amount
