module.exports = {
  maxWorkers: "10%",
  coverageProvider: "v8",
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
