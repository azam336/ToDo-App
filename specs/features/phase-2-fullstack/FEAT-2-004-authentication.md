# FEAT-2-004: Authentication

## Metadata
| Field | Value |
|-------|-------|
| **Feature ID** | FEAT-2-004 |
| **Phase** | II - Full Stack Web |
| **Status** | Draft |
| **Priority** | P0 - Critical |
| **Constitution Refs** | Section 5.1 (Auth), Section 5.2 (Data Protection), BR-04 |
| **Architecture Ref** | ARCH-002 |

---

## Overview

### Description
Implement JWT-based authentication with secure registration, login, token refresh, and logout functionality. Follows Constitution security requirements including Argon2id password hashing and refresh token rotation.

### User Stories

```gherkin
AS A new user
I WANT TO register an account
SO THAT I can save and access my todos

AS A registered user
I WANT TO log in with my credentials
SO THAT I can access my todos securely

AS an authenticated user
I WANT my session to automatically refresh
SO THAT I don't have to log in frequently

AS a user
I WANT TO log out
SO THAT I can secure my account on shared devices
```

### Acceptance Criteria

- [ ] AC-01: Users can register with email, password, and name
- [ ] AC-02: Email addresses must be unique
- [ ] AC-03: Passwords are hashed with Argon2id
- [ ] AC-04: Users can log in with email and password
- [ ] AC-05: Login returns JWT access token and refresh token
- [ ] AC-06: Access tokens expire after 15 minutes
- [ ] AC-07: Refresh tokens expire after 7 days
- [ ] AC-08: Refresh tokens are rotated on use
- [ ] AC-09: Users can log out (invalidate refresh token)
- [ ] AC-10: Invalid credentials return 401 without detail
- [ ] AC-11: Rate limiting prevents brute force attacks

---

## Functional Requirements

### FR-01: User Registration

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123",
  "name": "John Doe"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| `email` | Required, valid email format, max 255 chars |
| `password` | Required, min 8 chars, 1 uppercase, 1 lowercase, 1 number |
| `name` | Required, 1-100 chars |

**Response 201:**
```json
{
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2024-12-01T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbG...",
      "expiresIn": 900
    }
  },
  "meta": {
    "timestamp": "2024-12-01T10:00:00Z",
    "requestId": "req_xyz789"
  }
}
```

**Response Headers (Set Refresh Token):**
```
Set-Cookie: refresh_token=rt_abc123; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800
```

**Response 409 (Email Exists):**
```json
{
  "type": "https://api.todo.app/errors/conflict",
  "title": "Conflict",
  "status": 409,
  "detail": "An account with this email already exists",
  "instance": "/api/v1/auth/register"
}
```

---

### FR-02: User Login

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response 200:**
```json
{
  "data": {
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "tokens": {
      "accessToken": "eyJhbG...",
      "expiresIn": 900
    }
  },
  "meta": {
    "timestamp": "2024-12-01T10:00:00Z",
    "requestId": "req_xyz789"
  }
}
```

**Response 401 (Invalid Credentials):**
```json
{
  "type": "https://api.todo.app/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid email or password",
  "instance": "/api/v1/auth/login"
}
```

**Security Note:** Response must be identical for:
- Non-existent email
- Wrong password
- Account locked (if implemented)

This prevents user enumeration attacks.

---

### FR-03: Token Refresh

**Endpoint:** `POST /api/v1/auth/refresh`

**Request Cookies:**
```
Cookie: refresh_token=rt_abc123
```

**Response 200:**
```json
{
  "data": {
    "tokens": {
      "accessToken": "eyJhbG...",
      "expiresIn": 900
    }
  },
  "meta": {
    "timestamp": "2024-12-01T10:00:00Z",
    "requestId": "req_xyz789"
  }
}
```

**New Refresh Token Cookie:**
```
Set-Cookie: refresh_token=rt_new456; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800
```

**Response 401 (Invalid/Expired Token):**
```json
{
  "type": "https://api.todo.app/errors/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid or expired refresh token",
  "instance": "/api/v1/auth/refresh"
}
```

**Token Rotation:**
- On successful refresh, old token is invalidated
- New refresh token is issued
- If old token is reused after rotation → invalidate all user sessions (potential theft)

---

### FR-04: Logout

**Endpoint:** `POST /api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
Cookie: refresh_token=rt_abc123
```

**Response 200:**
```json
{
  "data": {
    "message": "Logged out successfully"
  },
  "meta": {
    "timestamp": "2024-12-01T10:00:00Z",
    "requestId": "req_xyz789"
  }
}
```

**Clear Cookie:**
```
Set-Cookie: refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=0
```

**Actions:**
- Revoke refresh token in database
- Clear refresh token cookie

---

### FR-05: Get Current User

**Endpoint:** `GET /api/v1/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response 200:**
```json
{
  "data": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-12-01T10:00:00Z"
  },
  "meta": {
    "timestamp": "2024-12-01T10:00:00Z",
    "requestId": "req_xyz789"
  }
}
```

---

## Technical Design

### Password Hashing

```typescript
// apps/api/src/utils/password.ts

import argon2 from 'argon2';

// OWASP recommended parameters for Argon2id
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,  // 64 MB
  timeCost: 3,        // 3 iterations
  parallelism: 4,     // 4 parallel threads
};

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}
```

### JWT Configuration

```typescript
// apps/api/src/config/jwt.ts

export const JWT_CONFIG = {
  // Access token: short-lived, stateless
  access: {
    secret: process.env.JWT_ACCESS_SECRET!,
    expiresIn: '15m',
    algorithm: 'RS256' as const,
  },

  // Refresh token: long-lived, stored in DB
  refresh: {
    expiresInDays: 7,
  },

  // Cookie settings
  cookie: {
    name: 'refresh_token',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  },
};
```

### JWT Payload Structure

```typescript
// Access Token Payload
interface AccessTokenPayload {
  sub: string;        // User ID
  email: string;
  iat: number;        // Issued at
  exp: number;        // Expiration
  jti: string;        // Token ID (for potential revocation)
}

// Refresh Token (stored in cookie, validated against DB)
interface RefreshTokenData {
  tokenId: string;    // Session ID in DB
  userId: string;
}
```

### Auth Service

```typescript
// apps/api/src/services/auth-service.ts

import { sign, verify } from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { hashPassword, verifyPassword } from '../utils/password';
import { UserRepository } from '@todo/db';
import { SessionRepository } from '@todo/db';
import { JWT_CONFIG } from '../config/jwt';

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private sessionRepo: SessionRepository
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
      email: input.email,
      passwordHash,
      name: input.name,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

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
    const tokens = await this.generateTokens(user);

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
    const session = await this.sessionRepo.findById(tokenData.tokenId);
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
    return this.generateTokens(user);
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const tokenData = this.parseRefreshToken(refreshToken);
    if (tokenData) {
      await this.sessionRepo.revoke(tokenData.tokenId);
    }
  }

  private async generateTokens(user: User): Promise<TokenResult> {
    // Create access token
    const accessToken = sign(
      {
        sub: user.id,
        email: user.email,
        jti: nanoid(),
      },
      JWT_CONFIG.access.secret,
      {
        expiresIn: JWT_CONFIG.access.expiresIn,
        algorithm: JWT_CONFIG.access.algorithm,
      }
    );

    // Create refresh token session
    const sessionId = nanoid();
    const expiresAt = new Date(
      Date.now() + JWT_CONFIG.refresh.expiresInDays * 24 * 60 * 60 * 1000
    );

    await this.sessionRepo.create({
      id: sessionId,
      userId: user.id,
      expiresAt,
    });

    const refreshToken = this.createRefreshToken(sessionId, user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private createRefreshToken(sessionId: string, userId: string): string {
    // Simple encoding - could also use JWT
    const data = JSON.stringify({ tokenId: sessionId, userId });
    return Buffer.from(data).toString('base64url');
  }

  private parseRefreshToken(token: string): RefreshTokenData | null {
    try {
      const data = Buffer.from(token, 'base64url').toString();
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  private sanitizeUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
```

### Auth Routes

```typescript
// apps/api/src/routes/auth/register.ts

import { FastifyPluginAsync } from 'fastify';
import { registerSchema } from '@todo/shared';

const registerRoute: FastifyPluginAsync = async (server) => {
  server.post(
    '/register',
    {
      schema: {
        tags: ['auth'],
        summary: 'Register a new user',
        body: registerSchema,
        response: {
          201: authResponseSchema,
          400: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const authService = server.authService;
      const result = await authService.register(request.body);

      // Set refresh token cookie
      reply.setCookie('refresh_token', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/v1/auth',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return reply.status(201).send({
        data: {
          user: result.user,
          tokens: {
            accessToken: result.tokens.accessToken,
            expiresIn: result.tokens.expiresIn,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: request.id,
        },
      });
    }
  );
};
```

### Frontend Auth Integration

```typescript
// apps/web/lib/auth.ts

import { api } from './api-client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

class AuthManager {
  private state: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
  };

  private refreshPromise: Promise<void> | null = null;

  async login(email: string, password: string): Promise<User> {
    const response = await api.post('/api/v1/auth/login', { email, password });

    this.state = {
      user: response.data.user,
      accessToken: response.data.tokens.accessToken,
      isAuthenticated: true,
    };

    // Schedule token refresh
    this.scheduleRefresh(response.data.tokens.expiresIn);

    return response.data.user;
  }

  async register(email: string, password: string, name: string): Promise<User> {
    const response = await api.post('/api/v1/auth/register', {
      email, password, name
    });

    this.state = {
      user: response.data.user,
      accessToken: response.data.tokens.accessToken,
      isAuthenticated: true,
    };

    this.scheduleRefresh(response.data.tokens.expiresIn);

    return response.data.user;
  }

  async refresh(): Promise<void> {
    // Prevent concurrent refresh calls
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await api.post('/api/v1/auth/refresh');
        this.state.accessToken = response.data.tokens.accessToken;
        this.scheduleRefresh(response.data.tokens.expiresIn);
      } catch (error) {
        this.logout();
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async logout(): Promise<void> {
    try {
      await api.post('/api/v1/auth/logout');
    } finally {
      this.state = {
        user: null,
        accessToken: null,
        isAuthenticated: false,
      };
    }
  }

  getAccessToken(): string | null {
    return this.state.accessToken;
  }

  private scheduleRefresh(expiresIn: number): void {
    // Refresh 1 minute before expiry
    const refreshIn = (expiresIn - 60) * 1000;
    setTimeout(() => this.refresh(), refreshIn);
  }
}

export const auth = new AuthManager();
```

---

## Security Measures

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/register` | 5 | 15 minutes |
| `/auth/login` | 10 | 15 minutes |
| `/auth/refresh` | 30 | 15 minutes |

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Maximum 128 characters (prevent DoS via long passwords)

### Token Security

| Measure | Implementation |
|---------|---------------|
| Access Token Storage | Memory only (not localStorage) |
| Refresh Token Storage | httpOnly cookie |
| Token Rotation | New refresh token on each use |
| Reuse Detection | Revoke all sessions on reuse |
| CSRF Protection | SameSite=Strict cookie |

---

## Test Cases

### Unit Tests

| Test ID | Description |
|---------|-------------|
| UT-AUTH-001 | Hash password with Argon2id |
| UT-AUTH-002 | Verify correct password |
| UT-AUTH-003 | Reject incorrect password |
| UT-AUTH-004 | Generate valid JWT access token |
| UT-AUTH-005 | Verify JWT signature |
| UT-AUTH-006 | Reject expired JWT |

### Integration Tests

| Test ID | Description |
|---------|-------------|
| IT-AUTH-001 | Register creates user and returns tokens |
| IT-AUTH-002 | Register fails for duplicate email |
| IT-AUTH-003 | Login returns tokens for valid credentials |
| IT-AUTH-004 | Login fails for invalid credentials |
| IT-AUTH-005 | Refresh returns new tokens |
| IT-AUTH-006 | Refresh fails for revoked token |
| IT-AUTH-007 | Logout invalidates refresh token |
| IT-AUTH-008 | Protected routes reject invalid tokens |
| IT-AUTH-009 | Rate limiting blocks excessive requests |

### E2E Tests

| Test ID | Description |
|---------|-------------|
| E2E-AUTH-001 | Full registration → login → use app → logout flow |
| E2E-AUTH-002 | Token auto-refresh maintains session |
| E2E-AUTH-003 | Expired session redirects to login |

---

## Dependencies

| Package | Purpose | Version |
|---------|---------|---------|
| `argon2` | Password hashing | ^0.31.0 |
| `jsonwebtoken` | JWT signing/verification | ^9.0.0 |
| `@fastify/jwt` | Fastify JWT plugin | ^8.0.0 |
| `@fastify/cookie` | Cookie handling | ^9.2.0 |
| `nanoid` | Token ID generation | ^5.0.0 |

---

## File Mapping

| File Path | Task ID |
|-----------|---------|
| `apps/api/src/utils/password.ts` | TASK-2-004-01 |
| `apps/api/src/config/jwt.ts` | TASK-2-004-02 |
| `apps/api/src/services/auth-service.ts` | TASK-2-004-03 |
| `apps/api/src/routes/auth/register.ts` | TASK-2-004-04 |
| `apps/api/src/routes/auth/login.ts` | TASK-2-004-05 |
| `apps/api/src/routes/auth/refresh.ts` | TASK-2-004-06 |
| `apps/api/src/routes/auth/logout.ts` | TASK-2-004-07 |
| `packages/db/src/repositories/session-repository.ts` | TASK-2-004-08 |
| `apps/web/lib/auth.ts` | TASK-2-004-09 |
| `apps/web/components/auth/login-form.tsx` | TASK-2-004-10 |
| `apps/web/components/auth/register-form.tsx` | TASK-2-004-11 |
| `apps/api/src/__tests__/auth/` | TASK-2-004-12 |

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Architect | | | |
| Lead Dev | | | |
| Security Lead | | | |
