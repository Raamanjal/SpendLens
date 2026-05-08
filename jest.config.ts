
import type { Config } from 'jest';

const config: Config = {
  preset:          'ts-jest',
  testEnvironment: 'node',

  // so @/ imports work in tests
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // load .env.test before every test file
  setupFiles: ['<rootDir>/jest.setup.ts'],

  // only look in __tests__ folder
  testMatch: ['**/__tests__/**/*.test.ts'],

  // ignore next.js build output
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],

  // show each test name in output
  verbose: true,
};

export default config;