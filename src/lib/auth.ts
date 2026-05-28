import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";

const VALID_PASSWORD = "123Login!";
const VALID_DOMAIN = "@awesomity.rw";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const COOKIE_NAME = "provigator_session";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export function isValidEmail(email: string): boolean {
  return email.toLowerCase().endsWith(VALID_DOMAIN);
}

export function isValidPassword(password: string): boolean {
  return password === VALID_PASSWORD;
}

export async function createSession(email: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const session = await db.session.create({
    data: { email: email.toLowerCase(), expiresAt },
  });

  const token = await new SignJWT({
    sessionId: session.id,
    email: session.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .sign(getSecret());

  return token;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const sessionId = payload.sessionId as string;
    const session = await db.session.findFirst({
      where: {
        id: sessionId,
        expiresAt: { gt: new Date() },
      },
    });
    if (!session) return null;
    return { email: session.email, sessionId: session.id };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret());
      await db.session.delete({
        where: { id: payload.sessionId as string },
      }).catch(() => {});
    } catch {}
  }
  cookieStore.delete(COOKIE_NAME);
}

export async function getAllActiveSessions() {
  return db.session.findMany({
    where: { expiresAt: { gt: new Date() } },
    select: { email: true },
  });
}
