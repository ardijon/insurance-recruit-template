import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateHome(): void {
  revalidatePath("/");
  revalidateTag("home", "max");
}
