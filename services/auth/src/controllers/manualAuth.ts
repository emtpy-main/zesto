import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import TryCatch from "../middlewares/trycatch.js";
import User from "../model/User.js";
import axios from "axios";
import getBuffer from "../config/datauri.js";

export const manualLogin = TryCatch(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.authProvider !== "local") {
    return res.status(403).json({
      message: `This email is registered via ${user.authProvider}. Please sign in with Google.`,
    });
  }

  if (!user.password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const userResponse = user.toObject();
  delete userResponse.password;
  const token = jwt.sign(
    { user: userResponse },
    process.env.JWT_SEC as string,
    { expiresIn: "15d" },
  );

  res.status(200).json({
    message: "Logged in successfully",
    token,
    user: userResponse,
  });
});

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const registerUser = TryCatch(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      message: "Name is required and must be at least 2 characters long.",
    });
  }

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      message: "A valid email address is required.",
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      message: "Password is required and must be at least 6 characters long.",
    });
  }

  if (role && !["rider", "customer", "seller", "admin"].includes(role)) {
    return res.status(400).json({
      message:
        "Invalid role. Select valid role like rider, customer, seller, admin.",
    });
  }

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({
        message: "Please give image.",
      });
    }

  const existingUser = await User.findOne({ email }).lean();

  if (existingUser) {
    return res.status(409).json({
      message: "An account with this email already exists. Please log in.",
    });
  }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer?.content) {
      return res.status(500).json({
        message: "Failed to create file buffer",
      });
    }

    const { data: uploadResult } = await axios.post(
      `${process.env.UTILS_SERVICE}/api/upload`,
      {
        buffer: fileBuffer.content,
      },
    );

  const newUser = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    image: uploadResult.url ||  "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    role: role || null,
    authProvider: "local",
  });

  const userPayload = newUser.toObject();
  delete userPayload.password;

  const token = jwt.sign(userPayload, process.env.JWT_SEC as string, {
    expiresIn: "15d",
  });

  res.status(201).json({
    message: "User registered successfully",
    token,
    user: userPayload,
  });
});
