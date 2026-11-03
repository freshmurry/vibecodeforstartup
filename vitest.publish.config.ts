import { defineConfig } from 'vitest/config';

// Standalone config for the PublishService tests (node pool).
// The repo's default vitest.config.ts uses the Workers pool with a
// wrangler.test.jsonc that does not exist in the repo.
export default defineConfig({
    test: {
        include: ['worker/services/publish/**/*.test.ts'],
        environment: 'node',
    },
});
