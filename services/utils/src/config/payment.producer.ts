import { getChannel } from "./rabbitmq";

export const publishPaymentSucess = async (payload: {
  orderId: string;
  paymentId: string;
  provider: "razorpay";  
}) => {
  const channel = getChannel();
  (channel.sendToQueue(
    process.env.PAYMENT_QUEUE!,
    Buffer.from(
      JSON.stringify({
        type: "PAYMENT_SUCCESS",
        data: payload,
      }),
    ),
  ),
    { persistent: true });
};
