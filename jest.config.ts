import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^decentraland-ui2$': '<rootDir>/src/tests/__mocks__/decentraland-ui2.tsx',
    '^@/config$': '<rootDir>/src/tests/__mocks__/config.ts',
    '^@/config/(.*)$': '<rootDir>/src/tests/__mocks__/config.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg|woff|woff2|ttf|eot)$': '<rootDir>/src/tests/__mocks__/fileMock.ts',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts'],
  transformIgnorePatterns: ['node_modules/(?!(decentraland-ui2|@livekit|@dcl|@mui|@emotion)/)'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true
        }
      }
    ],
    '^.+\\.jsx?$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react'] }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/tests/**',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ]
}

// eslint-disable-next-line import/no-default-export
export default config
