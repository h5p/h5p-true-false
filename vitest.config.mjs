import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    clearMocks: true,
    environment: 'jsdom',
    include: ['test/**/*.vitest.js'],
    setupFiles: ['./test/setup-vitest.js']
  }
});