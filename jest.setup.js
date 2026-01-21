// Jest setup file for global test configuration

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test.db'

// Increase timeout for property-based tests
jest.setTimeout(30000)
