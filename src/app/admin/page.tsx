import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/AdminPanel";
import { getAdminSession } from "@/lib/auth";
import { getProducts, getSettings, storageMode } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [products, settings] = await Promise.all([
    getProducts(true),
    getSettings(),
  ]);

  return (
    <AdminPanel
      initialProducts={products}
      initialSettings={settings}
      storage={storageMode()}
      role={session.role}
      username={session.username}
    />
  );
}
