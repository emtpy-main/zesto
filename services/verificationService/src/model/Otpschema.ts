import mongoose, { Document } from "mongoose";

// 1. Added createdAt and updatedAt to match the timestamps option
export interface IOtp extends Document {
  otpCode: string;
  purpose: "DELIVERY" | "LOGIN" | "PASSWORD_RESET";
  targetId: string;
  targetModel: string;
  recipient: string;
  isUsed: boolean;
  failedAttempts: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Added <IOtp> to the Schema constructor for strict type enforcement
const OtpSchema = new mongoose.Schema<IOtp>(
  {
    otpCode: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["DELIVERY", "LOGIN", "PASSWORD_RESET"],
      required: true,
    },
    targetId: { type: String, required: true },
    targetModel: { type: String, required: true },
    recipient: { type: String, required: true },
    isUsed: { type: Boolean, default: false },
    failedAttempts: { type: Number, default: 0 },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0, 
    },
  },
  { timestamps: true }
);

// Exporting as default works perfectly with "type": "module"
export default mongoose.model<IOtp>("Otp", OtpSchema);