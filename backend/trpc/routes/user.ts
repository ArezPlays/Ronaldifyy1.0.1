import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

const UserProfileSchema = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string().email(),
  age: z.number().nullable(),
  position: z.enum(['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK']).nullable(),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).nullable(),
  goals: z.array(z.enum(['shooting', 'dribbling', 'passing', 'speed', 'fitness', 'defense'])),
  onboardingCompleted: z.boolean(),
  subscriptionStatus: z.enum(['free', 'pro']),
});

export const userRouter = createTRPCRouter({
  getProfile: publicProcedure
    .input(z.object({ uid: z.string() }))
    .query(async ({ input }) => {
      console.log("Getting user profile for:", input.uid);
      return null;
    }),

  updateProfile: publicProcedure
    .input(z.object({
      uid: z.string(),
      updates: UserProfileSchema.partial(),
    }))
    .mutation(async ({ input }) => {
      console.log("Updating user profile:", input.uid, input.updates);
      return { success: true };
    }),

  completeOnboarding: publicProcedure
    .input(z.object({
      uid: z.string(),
      position: z.enum(['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'LB', 'RB', 'CB', 'GK']).nullable(),
      skillLevel: z.enum(['beginner', 'intermediate', 'advanced']).nullable(),
      goals: z.array(z.enum(['shooting', 'dribbling', 'passing', 'speed', 'fitness', 'defense'])),
    }))
    .mutation(async ({ input }) => {
      console.log("Completing onboarding for:", input.uid);
      return { success: true, onboardingCompleted: true };
    }),
});
