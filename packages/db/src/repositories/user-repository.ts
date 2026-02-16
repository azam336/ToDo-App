import { eq } from 'drizzle-orm';
import { db } from '../client.js';
import { users, type User, type NewUser } from '../schema/users.js';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
}

export interface UpdateUserInput {
  name?: string;
  passwordHash?: string;
}

export class UserRepository {
  async create(input: CreateUserInput): Promise<User> {
    const [row] = await db
      .insert(users)
      .values({
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.name,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create user');
    }

    return row;
  }

  async findById(id: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return row ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    return row ?? null;
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData['name'] = input.name;
    if (input.passwordHash !== undefined) updateData['passwordHash'] = input.passwordHash;

    const [row] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!row) {
      throw new Error(`User not found: ${id}`);
    }

    return row;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const [row] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    return !!row;
  }
}
