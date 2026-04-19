import { getChannel } from "./rabbitmq.js";
import { randomUUID } from "crypto";

export interface IOtpMessage {
  // 1. Meta Data (For tracking & debugging)
  eventId: string;          // Unique UUID for this specific message
  timestamp: Date;          // When the message was queued
 
  channel: "SMS" | "EMAIL" | "WHATSAPP";
  template: "DELIVERY_OTP" | "LOGIN_OTP" | "MERCHANT_WELCOME";
  recipient: string;        // E.g., "+919876543210" or "user@email.com"

  data: {
    otpCode: string;
    userName?: string;      // Optional: Good for email greetings
    orderId?: string;       // Optional: Context for the delivery
   // restaurantName?: string; // Optional: For future use
  };
}

export const publishOtpMessage = async (
  channelType: "SMS" | "EMAIL" | "WHATSAPP",
  template: string,
  recipient: string,
  data: any
) => {
    const channel = getChannel();
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }

  const messagePayload = {
    eventId: randomUUID(),
    timestamp: new Date(),
    channel: channelType,
    template,
    recipient,
    data,
  };
  await channel.assertQueue(process.env.OTP_QUEUE!, { durable: true }); 
  channel.sendToQueue(process.env.OTP_QUEUE!, Buffer.from(JSON.stringify(messagePayload)), {
    persistent: true, 
  });

  console.log(`[x] Published ${template} to ${process.env.OTP_QUEUE} for ${recipient}`);
};