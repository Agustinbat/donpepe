import { NextResponse } from "next/server";
import {
  authenticateUser,
  createAdminSession,
  setAdminCookie,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };
    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";

    const session = authenticateUser(username, password);
    if (!session) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 },
      );
    }

    const token = await createAdminSession(session);
    await setAdminCookie(token);

    return NextResponse.json({
      ok: true,
      role: session.role,
      username: session.username,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo iniciar sesión" },
      { status: 500 },
    );
  }
}
