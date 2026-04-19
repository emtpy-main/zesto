import { IUser } from "../model/User.js";
import { getChannel } from "./rabbitmq.js";

export const publishEvent = async (user: IUser, admin?: string[]) => {
  try {
    const channel = getChannel();
    const emailPayload = {
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      adminEmails: admin,
    };
    channel.sendToQueue(
      process.env.EMAIL_QUEUE!,
      Buffer.from(JSON.stringify({ data: emailPayload })),
      {
        persistent: true,
      },
    );
    console.log("Email published in email_queue 📥: " , emailPayload);
  } catch (error) {
    console.log("Error while publishing email in email_queue: ",error);
  }
};
