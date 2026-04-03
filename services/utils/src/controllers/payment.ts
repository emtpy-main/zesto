import { Request, Response } from "express";
import axios from "axios";
import { razorpay } from "../config/razorpay";
import { verifyRazorpaySignature } from "../config/verifyRazorpay";
import { publishPaymentSucess } from "../config/payment.producer";

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    // internal api to get order details
    const { data } = await axios.get(
      `${process.env.RESTAURANT_SERVICE}/api/order/payment/${orderId}`,
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      },
    );
    const razorpayOrder = await razorpay.orders.create({
      amount: data.amount * 100,
      currency: "INR",
      receipt: orderId,
    });
    res.json({
      razorpayOrderId: razorpayOrder.id,
      razorpayAmount: razorpayOrder.amount,
      razorpayCurrency: razorpayOrder.currency,
      key: process.env.TEST_RAZORPAY_API_KEY,
    });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error.message);

    res.status(500).json({
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = req.body;
  
  const isValid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  );
  if (!isValid) {
    return res.status(400).json({
      message: "Payment verification failed",
    });
  }
  await publishPaymentSucess({
    orderId,
    paymentId: razorpay_payment_id,
    provider: "razorpay",
  });
  res.json({
    message: "Payment verified successfully",
  });
};
