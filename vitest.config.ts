import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  test: {
    coverage: {
      exclude: [
        'node_modules/',
        'scripts/',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.config.ts',
        '**/*.config.mjs',
        '**/*.d.ts',
        '**/*.md',
        '**/*.json',
      ],
      include: ['core/**/*', 'app/**/*', 'features/**/*'],
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
    },
    environment: 'node',
    exclude: ['node_modules', 'e2e/**'],
    globals: true,
    maxWorkers: 1,
  },
})
