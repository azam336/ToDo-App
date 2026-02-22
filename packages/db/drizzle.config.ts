import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: ['./dist/schema/users.js', './dist/schema/todos.js', './dist/schema/sessions.js'],
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DATABASE_URL'] ?? 'postgresql://postgres:postgres@localhost:5432/todo',
  },
  verbose: true,
  strict: true,
});
