import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Use Node.js compatibility for better Next.js support
  nodejsCompat: true,
});
