import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { seedProducts } from "@/app/actions";

export const dynamic = "force-dynamic";

// The "Seed demo products" form on /cashback and /downloads POSTs here.
export async function POST() {
  await seedProducts();
  revalidatePath("/cashback");
  revalidatePath("/downloads");
  redirect("/cashback");
}
