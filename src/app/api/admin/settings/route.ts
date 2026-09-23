import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getSettings, updateSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json(
      { error: "Solo el administrador puede cambiar estos datos" },
      { status: 403 },
    );
  }

  try {
    const body = (await request.json()) as {
      whatsapp_number?: string;
      business_name?: string;
      address?: string;
      phone?: string;
      tagline?: string;
    };

    if (body.whatsapp_number !== undefined) {
      const digits = body.whatsapp_number.replace(/\D/g, "");
      if (digits.length < 8) {
        return NextResponse.json(
          { error: "Número de WhatsApp inválido" },
          { status: 400 },
        );
      }
    }

    const settings = await updateSettings(body);
    return NextResponse.json({ settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudieron guardar los ajustes" },
      { status: 500 },
    );
  }
}
