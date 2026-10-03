import { saveUpload } from "@/lib/upload-store";
import { validateImageAndGetFilename } from "@/lib/image-storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export type UploadResult = { url: string } | { error: string; status: number };

export async function validateAndStoreUpload(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "فرمت فایل مجاز نیست (jpg, png, gif, webp)", status: 422 };
  }
  if (file.size > MAX_SIZE) {
    return { error: "حجم فایل نباید بیشتر از ۵ مگابایت باشد", status: 422 };
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const valid = validateImageAndGetFilename(buffer, file.type);
  if (!valid) {
    return { error: "فایل معتبر نیست (فقط عکس مجاز است)", status: 422 };
  }
  return { url: await saveUpload(buffer, file.type) };
}
