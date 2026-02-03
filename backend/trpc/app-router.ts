import { createTRPCRouter } from "./create-context";
import { userRouter } from "./routes/user";
import { subscriptionRouter } from "./routes/subscription";
import { aiRouter } from "./routes/ai";
import { notificationsRouter } from "./routes/notifications";

export const appRouter = createTRPCRouter({
  user: userRouter,
  subscription: subscriptionRouter,
  ai: aiRouter,
  notifications: notificationsRouter,
});

export type AppRouter = typeof appRouter;
