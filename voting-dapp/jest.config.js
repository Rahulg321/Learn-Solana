/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Optional: If your source files are not in src, adjust roots
  // roots: ['<rootDir>/tests'], // Assuming your tests are in a 'tests' folder
  // Optional: If your tsconfig.json is not in the root
  // globals: {
  //   'ts-jest': {
  //     tsconfig: 'tsconfig.json',
  //   },
  // },
  // Optional: Setup file for test environment if needed
  // setupFilesAfterEnv: ['./jest.setup.js'], // Create this file if you need global setup
}
