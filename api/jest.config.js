/** @type {import('jest').Config} */
const config = {
	verbose: true,
	testMatch: ['<rootDir>/test/**/*.spec.[jt]s?(x)'],
	globalSetup: '<rootDir>/test/scripts/setup.ts',
	preset: 'ts-jest'
};

module.exports = config; // eslint-disable-line unicorn/prefer-module
