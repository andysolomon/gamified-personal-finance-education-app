import { z } from "zod";

export const exchangeTokenRequestSchema = z.object({
  public_token: z.string().min(1, "public_token is required"),
  metadata: z.object({
    institution: z.object({
      name: z.string(),
      institution_id: z.string(),
    }),
    accounts: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
        subtype: z.string().nullable(),
        mask: z.string().nullable(),
      }),
    ),
  }),
});

export type ExchangeTokenRequest = z.infer<typeof exchangeTokenRequestSchema>;

export const syncRequestSchema = z.object({
  plaid_item_id: z.string().uuid("plaid_item_id must be a valid UUID"),
});

export type SyncRequest = z.infer<typeof syncRequestSchema>;
