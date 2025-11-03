// prisma/prisma.config.ts
import { defineConfig } from "prisma/config";

export default defineConfig({
  seed: "node prisma/seed.cjs",
} as any);
