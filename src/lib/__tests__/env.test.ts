import { describe, expect, it } from "vitest";
import { envSchema } from "@/lib/env";

describe("envSchema", () => {
  it("accepts valid minimal env", () => {
    const result = envSchema.safeParse({
      NODE_ENV: "development",
    });
    expect(result.success).toBe(true);
  });

  it("defaults NODE_ENV to development", () => {
    const result = envSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.NODE_ENV).toBe("development");
    }
  });

  it("rejects invalid NODE_ENV", () => {
    const result = envSchema.safeParse({
      NODE_ENV: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid NEXT_PUBLIC_SUPABASE_URL", () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid full env", () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-key",
      NODE_ENV: "production",
    });
    expect(result.success).toBe(true);
  });
});
