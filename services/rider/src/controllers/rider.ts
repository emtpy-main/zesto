import axios from "axios";
import getBuffer from "../config/datauri.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import TryCatch from "../middlewares/tryCatch.js";
import { Rider } from "../model/Rider.js";

const phoneNumberRegex = /^\+?[1-9]\d{6,14}$/;
const aadharNumberRegex = /^\d{4}\s?\d{4}\s?\d{4}$/;
const drivingLicenceNumberRegex =
  /^[A-Za-z]{2}[-\s]?\d{2}[-\s]?\d{4}[-\s]?\d{7}$/;

export const addRiderProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user)
      return res.status(401).json({
        message: "Unauthorized",
      });

    const file = req.file;
    if (!file)
      return res.status(400).json({
        message: "Rider image is required",
      });

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content)
      return res.status(500).json({
        message: "failed to generate image buffer",
      });

    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_SERVICE}/api/upload`,
      {
        buffer: fileBuffer.content,
      },
    );

    const {
      phoneNumber,
      aadharNumber,
      drivingLicenceNumber,
      latitude,
      longitude,
    } = req.body;

    if (
      !phoneNumber ||
      !aadharNumber ||
      !drivingLicenceNumber ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingProfile = await Rider.findOne({
      userId: user._id,
    });

    if (existingProfile)
      return res.status(400).json({
        message: "Rider profile already exists",
      });

    if (!phoneNumberRegex.test(phoneNumber)) {
      return res.status(400).json({
        message:
          "Invalid phone number format. Use +919876543210 or 9876543210.",
      });
    }

    if (!aadharNumberRegex.test(aadharNumber)) {
      return res.status(400).json({
        message: "Invalid Aadhaar number format. It must be a 12-digit number.",
      });
    }

    if (!drivingLicenceNumberRegex.test(drivingLicenceNumber)) {
      return res.status(400).json({
        message:
          "Invalid driving licence number format. Please enter a valid licence number.",
      });
    }

    const riderProfile = await Rider.create({
      userId: user._id,
      picture: uploadResult.url,
      phoneNumber,
      aadharNumber,
      drivingLicenceNumber,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      isAvailable: false,
      isVerified: false,
    });

    return res.status(201).json({
      message: "Rider profile create successfully",
      riderProfile,
    });
  },
);

export const fetchMyProfile = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user)
      return res.status(401).json({
        message: "Unauthorized",
      });

    const account = await Rider.findOne({ userId: user._id });
    return res.json(account);
  },
);

export const toggleRiderAvailablity = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user)
      return res.status(401).json({
        message: "Unauthorized",
      });

    const { isAvailable, latitude, longitude } = req.body;

    if (typeof isAvailable !== "boolean")
      return res.status(400).json({ message: "isAvailable must be boolean" });

    if (latitude === undefined || longitude === undefined)
      return res.status(400).json({ message: "Location is required" });

    const rider = await Rider.findOne({
      userId: user._id,
    });

    if (!rider) {
      return res.status(404).json({
        message: "Rider Profile not found",
      });
    }

    if (isAvailable && !rider.isVerified)
      return res.status(403).json({ message: "Rider is not verified" });

    rider.isAvailable = isAvailable;
    rider.location = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    rider.lastActiveAt = new Date();

    await rider.save();

    res.json({
      message: isAvailable ? "Rider is now online" : "Rider is now offline",
      rider,
    });
  },
);

export const acceptOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const riderUserId = req.user?._id;
  const { orderId } = req.params;

  if (!riderUserId)
    return res.status(400).json({
      message: "Please login",
    });

  const rider = await Rider.findOne({ userId: riderUserId, isAvailable: true });
  if (!rider) {
    return res.status(404).json({
      message: "Rider not round",
    });
  }

  try {
    const { data } = await axios.put(
      `${process.env.RESTAURANT_SERVICE}/api/order/assign/rider`,
      {
        orderId,
        riderId: rider._id.toString(),
        riderName: rider.picture,
        riderPhone: rider.phoneNumber,
      },
      {
        headers: {
          "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
        },
      },
    );
    if (data.success) {
      const riderDetails = await Rider.findOneAndUpdate(
        {
          userId: riderUserId,
          isAvailable: true,
        },
        {
          isAvailable: false,
        },
        { new: true },
      );
      res.json({ message: "Order accepted" });
    }
  } catch (error) {
    res.status(400).json({ message: "Order already taken" });
  }
});

export const fetchMyCurrentOrder = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const riderUserId = req.user?._id;

    if (!riderUserId) {
      return res.status(400).json({
        message: "Please login",
      });
    }

    const rider = await Rider.findOne({
      userId: riderUserId,
      isVerified: true,
    });

    if (!rider) {
      return res.status(404).json({
        message: "Rider not found",
      });
    }

    try {
      const { data } = await axios.get(
        `${process.env.RESTAURANT_SERVICE}/api/order/current/rider/${rider._id}`,
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        },
      );

      return res.json({
        order: data,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error?.response?.data?.message || "Internal Server Error",
      });
    }
  },
);

export const updateOrderStatus = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Please login" });
    }

    const rider = await Rider.findOne({ userId });
    if (!rider) {
      return res.status(404).json({
        message: "No rider found",
      });
    }

    const { orderId } = req.params;

    try {
      const { data } = await axios.put(
        `${process.env.RESTAURANT_SERVICE}/api/order/update/status/rider`,
        { orderId },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        },
      );
      //console.log("update router: ", data);

      return res.json({
        message: "Order status updated successfully",
        data,
      });
    } catch (error: any) {
      //console.log("rider service error: ", error);
      return res.status(500).json({
        message: error?.response?.data?.message || "Internal Server Error",
      });
    }
  },
);
export const confirmOrderStatus = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Please login" });
    }

    const rider = await Rider.findOne({ userId });
    if (!rider) {
      return res.status(404).json({
        message: "No rider found",
      });
    }

    const { orderId } = req.params;
    const { otpCode } = req.body;
    if (!otpCode) {
      return res.status(404).json({
        message: "Otp not found",
      });
    }
    //console.log("rider service: ", otpCode);

    try {
      const { data } = await axios.put(
        `${process.env.RESTAURANT_SERVICE}/api/order/update/status/rider/confirmation`,
        { orderId, otpCode },
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        },
      );

      return res.json({
        message: "Order status updated successfully",
        data,
      });
    } catch (error: any) {
      //console.log(error);
      return res.status(500).json({
        message: error?.response?.data?.message || "Internal Server Error",
      });
    }
  },
);

export const ResendOtp = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "Please login" });
  }

  const rider = await Rider.findOne({ userId });
  if (!rider) {
    return res.status(404).json({
      message: "No rider found",
    });
  }

  const { orderId } = req.params;
  //console.log("Order Id", orderId);
    try {
      const { data } = await axios.post(
        `${process.env.RESTAURANT_SERVICE}/api/order/resend-otp/${orderId}`,
        {},
        {
          headers: {
            "x-internal-key": process.env.INTERNAL_SERVICE_KEY,
          },
        },
      );
      //console.log("Resend Otp", data);

      return res.json({
        message: "OTP resend successfully",
        data,
      });
    } catch (error: any) {
      //console.log("rider service error: ", error);
      return res.status(500).json({
        message: error?.response?.data?.message || "Internal Server Error",
      });
    }
});
