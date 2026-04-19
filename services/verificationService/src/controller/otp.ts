import { Request, Response } from "express";
import Otp from "../model/Otpschema.js";
import axios from "axios";
import { publishOtpMessage } from "../config/otp.publish.js";

export const GenerateOtp = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { purpose, targetId, targetModel, recipient } = req.body;

    // Validate 'purpose'
    const validPurposes = ["DELIVERY", "LOGIN", "PASSWORD_RESET"];
    if (!purpose || !validPurposes.includes(purpose)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid or missing 'purpose'. Must be DELIVERY, LOGIN, or PASSWORD_RESET.",
      });
    }
    //console.log(`purpose ${purpose}, targetid ${targetId}, targetModel ${targetModel}, recipient ${recipient}`);
    // Validate 'targetId' and 'targetModel'
    if (!targetId || typeof targetId !== "string" || targetId.trim() === "") {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or missing 'targetId'." });
    }
    if (
      !targetModel ||
      typeof targetModel !== "string" ||
      targetModel.trim() === ""
    ) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or missing 'targetModel'." });
    }

    // Validate 'recipient' (Phone number format: + followed by 10-15 digits)
    //! in future validate if mobile otp established
    // const phoneRegex = /^\+[1-9]\d{10,14}$/;
    // if (!recipient || !phoneRegex.test(recipient)) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Invalid 'recipient'. Must be a valid phone number with country code (e.g., +919876543210)."
    //   });
    // }
    //! for now check recipient is email
    if (!recipient) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or missing 'recipient'." });
    }

    // Invalidate any previously unused OTP for this target
    await Otp.updateMany(
      {
        targetId,
        purpose,
        isUsed: false,
      },
      { $set: { isUsed: true } },
    );

    // Generate a 4-digit OTP (1000 to 9999)
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour lifetime

    const newOtp = await Otp.create({
      otpCode,
      purpose,
      targetId,
      targetModel,
      recipient,
      expiresAt,
    });
    //console.log("new generate otp",newOtp);
    //! TODO: Trigger SMS Provider to send 'otpCode' to 'recipient' here
    // user name and details
    const { data } = await axios.get(
      `${process.env.AUTH_SERVICE}/api/auth/internal/v1/profile/${recipient}`,
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      },
    );
    const userName = data.data?.name;
    const email = data.data?.email;

    publishOtpMessage("EMAIL", `${purpose}_OTP`,email, {
      userName,
      otpCode: newOtp.otpCode, 
      orderId: targetId,
    });
    
    res.status(201).json({
      success: true,
      message: "Otp generated and sent.",
    });
  } catch (error) {
    console.error("GenerateOtp Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// We use Promise<any> to satisfy TypeScript for Express controllers that use multiple return statements
export const VerifyOtp = async (req: Request, res: Response): Promise<any> => {
  try {
    const { otpCode, purpose, targetId } = req.body;

    if (!otpCode || typeof otpCode !== "string" || !/^\d{4}$/.test(otpCode)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid 'otpCode'. It must be exactly a 4-digit numeric string.",
      });
    }

    const validPurposes = ["DELIVERY", "LOGIN", "PASSWORD_RESET"];
    if (!purpose || !validPurposes.includes(purpose)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid or missing 'purpose'. Must be DELIVERY, LOGIN, or PASSWORD_RESET.",
      });
    }

    if (!targetId || typeof targetId !== "string" || targetId.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing 'targetId'.",
      });
    }

    const otp = await Otp.findOne({
      targetId,
      purpose,
      isUsed: false,
    });

    if (!otp) {
      return res
        .status(404)
        .json({ success: false, error: "OTP not found or expired" });
    }

    //  Check failed attempts (Max 5) - Updated to camelCase
    if (otp.failedAttempts >= 5) {
      return res.status(403).json({
        success: false,
        error: "Too many failed attempts. Request a new OTP.",
      });
    }
 
    if (otp.otpCode !== otpCode) { 
      otp.failedAttempts += 1;
      await otp.save();
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }

    
    otp.isUsed = true;
    await otp.save();

    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("VerifyOtp Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
