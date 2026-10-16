import { randomBytes } from "crypto";

export function generateApiKey(): string {
  return `df_${randomBytes(24).toString("hex")}`;
}