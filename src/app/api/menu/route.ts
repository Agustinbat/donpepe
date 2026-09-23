import { NextResponse } from "next/server";
import { getProducts, getSettings, storageMode } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [products, settings] = await Promise.all([
      getProducts(false),
      getSettings(),
    ]);

    return NextResponse.json({
      products,
      settings,
      storage: storageMode(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo cargar el menú" },
      { status: 500 },
    );
  }
}
