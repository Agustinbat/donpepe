import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getProducts, storageMode, updateProduct } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const products = await getProducts(true);
  return NextResponse.json({
    products,
    storage: storageMode(),
    role: session.role,
  });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      id?: string;
      price?: number;
      available?: boolean;
      name?: string;
      description?: string;
    };

    if (!body.id) {
      return NextResponse.json({ error: "Falta id" }, { status: 400 });
    }

    if (session.role === "staff") {
      if (body.available === undefined) {
        return NextResponse.json(
          { error: "Este usuario solo puede cambiar la disponibilidad" },
          { status: 403 },
        );
      }
      if (
        body.price !== undefined ||
        body.name !== undefined ||
        body.description !== undefined
      ) {
        return NextResponse.json(
          { error: "Este usuario solo puede cambiar la disponibilidad" },
          { status: 403 },
        );
      }

      const product = await updateProduct(body.id, {
        available: body.available,
      });
      return NextResponse.json({ product });
    }

    if (body.price !== undefined && (Number.isNaN(body.price) || body.price < 0)) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
    }

    const product = await updateProduct(body.id, {
      ...(body.price !== undefined ? { price: body.price } : {}),
      ...(body.available !== undefined ? { available: body.available } : {}),
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo actualizar el producto" },
      { status: 500 },
    );
  }
}
