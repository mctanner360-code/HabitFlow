import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { parseCookie, stringifyCookie } from "cookie";
import type { NeonHttpDatabase } from "@neondatabase/serverless";

const JWT_SECRET = process.env.JWT_SECRET || "habitforge-dev-secret-change-in-production";
const COOKIE_NAME = "habitforge_token";
const SALT_ROUNDS = 10;

export interface JwtPayload {
  userId: string;
  email: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const cookies = parseCookie(cookieHeader);
  return cookies[COOKIE_NAME] || null;
}

export function getUserFromRequest(request: Request): JwtPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export function createAuthCookie(token: string): string {
  return stringifyCookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function createLogoutCookie(): string {
  return stringifyCookie(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}