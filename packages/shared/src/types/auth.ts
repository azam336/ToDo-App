// Authentication types

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: PublicUser;
  tokens: AuthTokens;
}

export interface TokenRefreshResponse {
  tokens: AuthTokens;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  jti: string;
}
