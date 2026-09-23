import { MenuApp } from "@/components/MenuApp";
import { getProducts, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, settings] = await Promise.all([
    getProducts(false),
    getSettings(),
  ]);

  return <MenuApp products={products} settings={settings} />;
}
