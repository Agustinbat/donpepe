import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type AdminRole = "admin" | "staff";

export type AdminSession = {
  role: AdminRole;
  username: string;
};

const COOKIE_NAME = "don_pepe_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

type Account = {
  username: string;
  password: string;
  role: AdminRole;
};

function getSecret() {
  const secret =
    process.env.AUTH_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "don-pepe-fallback-secret";
  return new TextEncoder().encode(secret);
}

function getAccounts(): Account[] {
  return [
    {
      username: process.env.ADMIN_USER || "donpepe",
      password: process.env.ADMIN_PASSWORD || "donpepe2026#",
      role: "admin",
    },
    {
      username: process.env.STAFF_USER || "administrador",
      password: process.env.STAFF_PASSWORD || "administrador2026!",
      role: "staff",
    },
  ];
}

export function authenticateUser(
  username: string,
  password: string,
): AdminSession | null {
  const user = username.trim().toLowerCase();
  const pass = password;
  const match = getAccounts().find(
    (account) =>
      account.username.toLowerCase() === user && account.password === pass,
  );
  if (!match) return null;
  return { role: match.role, username: match.username };
}

export async function createAdminSession(
  session: AdminSession,
): Promise<string> {
  return new SignJWT({ role: session.role, username: session.username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const role = payload.role;
    const username = payload.username;
    if ((role !== "admin" && role !== "staff") || typeof username !== "string") {
      return null;
    }
    return { role, username };
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return Boolean(await getAdminSession());
}

export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function setAdminCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
