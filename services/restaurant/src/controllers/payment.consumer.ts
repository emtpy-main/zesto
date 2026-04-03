import { getChannel } from "../config/rabbitmq.js";
import Order from "../model/Order.js";

export const startPaymentConsumer = async () => {
  const channel = getChannel();

  channel.consume(process.env.PAYMENT_QUEUE!, async (msg) => {
    if (!msg) return;

    let order;  

    try {
      const event = JSON.parse(msg.content.toString());

      if (event.type !== "PAYMENT_SUCCESS") {
        channel.ack(msg);
        return;
      }

      const { orderId } = event.data;

      order = await Order.findOneAndUpdate(
        {
          _id: orderId,
          paymentStatus: { $ne: "paid" },
        },
        {
          $set: {
            paymentStatus: "paid",
            status: "placed",
          },
          $unset: {
            expiresAt: 1,
          },
        },
        { new: true } 
      );

      if (!order) {
        channel.ack(msg);
        return;
      }

      console.log("Order placed", order._id);
      channel.ack(msg); // ✅ don't forget this
    } catch (error) {
      console.error("Payment consumer Error: ", error);
    }
  });
};