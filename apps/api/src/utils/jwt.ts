import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "menew-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "menew-refresh";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    tenantId?: string;
}

export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    } as SignOptions);
}

export function generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
    } as SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}
