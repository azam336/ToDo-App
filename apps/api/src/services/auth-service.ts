import { nanoid } from 'nanoid';
import { UserRepository, SessionRepository } from '@todo/db';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { jwtConfig } from '../config/index.js';
import type { FastifyInstance } from 'fastify';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: PublicUser;
  tokens: TokenResult;
}

export interface TokenResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private sessionRepo: SessionRepository,
    private jwt: FastifyInstance['jwt']
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    // Check if email exists
    const existingUser = await this.userRepo.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    const user = await this.userRepo.create({
      email: input.email.toLowerCase(),
      passwordHash,
      name: input.name,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    // Find user
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      // Use same delay as password check to prevent timing attacks
      await verifyPassword(input.password, '$argon2id$v=19$m=65536,t=3,p=4$dummy');
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<TokenResult> {
    // Parse and validate refresh token
    const tokenData = this.parseRefreshToken(refreshToken);
    if (!tokenData) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Find session
    const session = await this.sessionRepo.findById(tokenData.sessionId);
    if (!session || session.revoked) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (new Date() > session.expiresAt) {
      throw new UnauthorizedError('Refresh token expired');
    }

    // Check if token was already used (reuse detection)
    if (session.usedAt) {
      // Potential token theft - revoke all user sessions
      await this.sessionRepo.revokeAllUserSessions(session.userId);
      throw new UnauthorizedError('Refresh token reuse detected');
    }

    // Mark old session as used
    await this.sessionRepo.markUsed(session.id);

    // Get user
    const user = await this.userRepo.findById(session.userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Generate new tokens
    return this.generateTokens(user.id, user.email);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenData = this.parseRefreshToken(refreshToken);
    if (tokenData) {
      await this.sessionRepo.revoke(tokenData.sessionId);
    }
  }

  private async generateTokens(userId: string, email: string): Promise<TokenResult> {
    const jti = nanoid();

    // Create access token
    const accessToken = this.jwt.sign(
      {
        sub: userId,
        email,
        jti,
      },
      { expiresIn: jwtConfig.access.expiresIn }
    );

    // Create refresh token session
    const sessionId = nanoid();
    const expiresAt = new Date(
      Date.now() + jwtConfig.refresh.expiresInDays * 24 * 60 * 60 * 1000
    );

    // Hash the session ID for storage
    const tokenHash = Buffer.from(sessionId).toString('base64');

    await this.sessionRepo.create({
      id: sessionId,
      userId,
      tokenHash,
      expiresAt,
    });

    const refreshToken = this.createRefreshToken(sessionId, userId);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private createRefreshToken(sessionId: string, userId: string): string {
    const data = JSON.stringify({ sessionId, userId });
    return Buffer.from(data).toString('base64url');
  }

  private parseRefreshToken(token: string): { sessionId: string; userId: string } | null {
    try {
      const data = Buffer.from(token, 'base64url').toString();
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private sanitizeUser(user: { id: string; email: string; name: string; createdAt: Date }): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
