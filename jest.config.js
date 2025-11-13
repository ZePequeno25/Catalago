/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testEnvironmentOptions: {
    useInMemory: true, // ← ESSA LINHASOLVE O ERRO
  },
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
  detectOpenHandles: true,
  forceExit: true,
  verbose: false,
  collectCoverage: false,
};