import { IUser } from "../model/User.js";
import { getChannel } from "./rabbitmq.js";

export const publishEvent = async (user: IUser) => {
  const channel = getChannel();
  const emailPayload = {
    name: user.name,
    email: user.email,
    role: user.role,
  };
  channel.sendToQueue(
    process.env.EMAIL_QUEUE!,
    Buffer.from(JSON.stringify({data:emailPayload})),{
        persistent:true
    }
  );
};
