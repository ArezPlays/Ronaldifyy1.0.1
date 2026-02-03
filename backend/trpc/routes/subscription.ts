import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

export const subscriptionRouter = createTRPCRouter({
  getStatus: publicProcedure
    .input(z.object({ uid: z.string() }))
    .query(async ({ input }) => {
      console.log("Getting subscription status for:", input.uid);
      return {
        isPro: false,
        tier: 'free' as const,
        expiresAt: null,
      };
    }),

  verifyPurchase: publicProcedure
    .input(z.object({
      uid: z.string(),
      purchaseToken: z.string(),
      productId: z.string(),
    }))
    .mutation(async ({ input }) => {
      console.log("Verifying purchase for:", input.uid, input.productId);
      return { success: true, isPro: true };
    }),

  syncWithRevenueCat: publicProcedure
    .input(z.object({ uid: z.string() }))
    .mutation(async ({ input }) => {
      console.log("Syncing RevenueCat for:", input.uid);
      return { success: true };
    }),
});
