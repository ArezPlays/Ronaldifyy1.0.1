import * as z from "zod";
import { createTRPCRouter, publicProcedure } from "../create-context";

const TELEGRAM_BOT_TOKEN = "7739765597:AAEqTqmXBXxlaDq6i4149rQ0x-Ch71HRUes";
const TELEGRAM_CHAT_ID = "7036385861";

async function sendTelegramMessage(message: string, chatId: string = TELEGRAM_CHAT_ID): Promise<boolean> {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  console.log('[Telegram] Attempting to send message to chat:', chatId);
  console.log('[Telegram] Message:', message);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    
    const result = await response.json();
    console.log('[Telegram] API Response:', JSON.stringify(result));
    
    if (!result.ok) {
      console.error('[Telegram] API error:', result.description);
      return false;
    }
    
    console.log('[Telegram] Message sent successfully, message_id:', result.result?.message_id);
    return true;
  } catch (error) {
    console.error('[Telegram] Failed to send message:', error);
    return false;
  }
}

export const notificationsRouter = createTRPCRouter({
  registerDevice: publicProcedure
    .input(z.object({
      uid: z.string(),
      pushToken: z.string(),
      platform: z.enum(['ios', 'android', 'web']),
    }))
    .mutation(async ({ input }) => {
      console.log("Registering device for:", input.uid, input.platform);
      return { success: true };
    }),

  sendTelegramNotification: publicProcedure
    .input(z.object({
      chatId: z.string().optional(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      console.log("Sending Telegram notification:", input.message);
      const success = await sendTelegramMessage(input.message, input.chatId || TELEGRAM_CHAT_ID);
      return { success };
    }),

  notifySubscription: publicProcedure
    .input(z.object({
      userName: z.string(),
      planType: z.enum(['weekly', 'monthly', 'yearly']),
      amount: z.string(),
      isRenewal: z.boolean().optional(),
      transactionId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { transactionId, userName, planType, amount } = input;
      
      const planEmoji = planType === 'yearly' ? '🏆' : planType === 'monthly' ? '⭐' : '✨';
      const message = `💰 <b>New Subscription!</b>\n\n${planEmoji} <b>Plan:</b> ${planType.charAt(0).toUpperCase() + planType.slice(1)}\n💵 <b>Amount:</b> ${amount}\n👤 <b>User:</b> ${userName}\n\n🎉 Ronaldify is growing!`;
      
      console.log('[Notification] Received subscription notification request');
      console.log('[Notification] User:', userName, 'Plan:', planType, 'Amount:', amount);
      console.log('[Notification] Transaction ID:', transactionId);
      
      const success = await sendTelegramMessage(message);
      
      if (!success) {
        console.log('[Notification] First attempt failed, scheduling retry...');
        setTimeout(async () => {
          console.log('[Notification] Retrying Telegram notification...');
          const retrySuccess = await sendTelegramMessage(message);
          console.log('[Notification] Retry result:', retrySuccess ? 'success' : 'failed');
        }, 3000);
      }
      
      console.log('[Notification] Returning result, success:', success);
      return { success, transactionId };
    }),

  scheduleReminder: publicProcedure
    .input(z.object({
      uid: z.string(),
      type: z.enum(['training', 'streak', 'goal']),
      scheduledFor: z.string(),
    }))
    .mutation(async ({ input }) => {
      console.log("Scheduling reminder for:", input.uid, input.type);
      return { success: true, reminderId: `reminder_${Date.now()}` };
    }),
});
