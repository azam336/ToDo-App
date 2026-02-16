import { db } from '../src/client.js';
import { users } from '../src/schema/users.js';
import { todos } from '../src/schema/todos.js';
import argon2 from 'argon2';

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

async function seed() {
  console.log('Seeding database...');

  // Create test user
  const passwordHash = await hashPassword('password123');

  const [user] = await db
    .insert(users)
    .values({
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
    })
    .returning();

  console.log(`Created user: ${user.email}`);

  // Create sample todos
  const sampleTodos = [
    {
      userId: user.id,
      title: 'Complete project documentation',
      description: 'Write comprehensive docs for the API',
      priority: 'high' as const,
      status: 'in_progress' as const,
      tags: ['work', 'documentation'],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    {
      userId: user.id,
      title: 'Review pull requests',
      description: 'Review pending PRs from team members',
      priority: 'medium' as const,
      status: 'pending' as const,
      tags: ['work', 'code-review'],
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    },
    {
      userId: user.id,
      title: 'Buy groceries',
      description: 'Milk, eggs, bread, vegetables',
      priority: 'low' as const,
      status: 'pending' as const,
      tags: ['personal', 'errands'],
    },
    {
      userId: user.id,
      title: 'Schedule dentist appointment',
      description: 'Annual checkup',
      priority: 'medium' as const,
      status: 'completed' as const,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tags: ['personal', 'health'],
    },
    {
      userId: user.id,
      title: 'Prepare presentation',
      description: 'Q4 review slides for leadership',
      priority: 'urgent' as const,
      status: 'pending' as const,
      tags: ['work', 'urgent'],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    },
  ];

  await db.insert(todos).values(sampleTodos);
  console.log(`Created ${sampleTodos.length} todos`);

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
