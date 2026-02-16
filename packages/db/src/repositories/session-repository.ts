import { eq, and, lt } from 'drizzle-orm';
import { db } from '../client.js';
import { sessions, type Session, type NewSession } from '../schema/sessions.js';

export interface CreateSessionInput {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export class SessionRepository {
  async create(input: CreateSessionInput): Promise<Session> {
    const [row] = await db
      .insert(sessions)
      .values({
        id: input.id,
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      })
      .returning();

    if (!row) {
      throw new Error('Failed to create session');
    }

    return row;
  }

  async findById(id: string): Promise<Session | null> {
    const [row] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id));

    return row ?? null;
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const [row] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.tokenHash, tokenHash));

    return row ?? null;
  }

  async revoke(id: string): Promise<void> {
    await db
      .update(sessions)
      .set({ revoked: true })
      .where(eq(sessions.id, id));
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ revoked: true })
      .where(eq(sessions.userId, userId));
  }

  async markUsed(id: string): Promise<void> {
    await db
      .update(sessions)
      .set({ usedAt: new Date() })
      .where(eq(sessions.id, id));
  }

  async deleteExpired(): Promise<number> {
    const result = await db
      .delete(sessions)
      .where(lt(sessions.expiresAt, new Date()));

    return result.rowCount ?? 0;
  }

  async isValid(id: string): Promise<boolean> {
    const session = await this.findById(id);

    if (!session) return false;
    if (session.revoked) return false;
    if (session.usedAt) return false;
    if (new Date() > session.expiresAt) return false;

    return true;
  }
}
