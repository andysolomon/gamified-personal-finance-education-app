import { describe, expect, it } from "vitest";
import { exchangeTokenRequestSchema } from "@/lib/validations/plaid";

describe("exchangeTokenRequestSchema", () => {
  const validPayload = {
    public_token: "public-sandbox-123",
    metadata: {
      institution: { name: "Chase", institution_id: "ins_1" },
      accounts: [
        { id: "acct-1", name: "Checking", type: "depository", subtype: "checking", mask: "1234" },
      ],
    },
  };

  it("accepts valid payload", () => {
    const result = exchangeTokenRequestSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects missing public_token", () => {
    const result = exchangeTokenRequestSchema.safeParse({
      metadata: validPayload.metadata,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty public_token", () => {
    const result = exchangeTokenRequestSchema.safeParse({
      ...validPayload,
      public_token: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing metadata", () => {
    const result = exchangeTokenRequestSchema.safeParse({
      public_token: "public-sandbox-123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing institution", () => {
    const result = exchangeTokenRequestSchema.safeParse({
      public_token: "public-sandbox-123",
      metadata: { accounts: [] },
    });
    expect(result.success).toBe(false);
  });

  it("accepts null subtype and mask in accounts", () => {
    const result = exchangeTokenRequestSchema.safeParse({
      ...validPayload,
      metadata: {
        ...validPayload.metadata,
        accounts: [
          { id: "acct-1", name: "Checking", type: "depository", subtype: null, mask: null },
        ],
      },
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty accounts array", () => {
    const result = exchangeTokenRequestSchema.safeParse({
      ...validPayload,
      metadata: {
        ...validPayload.metadata,
        accounts: [],
      },
    });
    expect(result.success).toBe(true);
  });
});
