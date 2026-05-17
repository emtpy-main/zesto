import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser } from "../model/User.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please login - no auth header",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Please Login - token missing",
      });
    }

    const decodedValue = jwt.verify(
      token,
      process.env.JWT_SEC as string
    ) as JwtPayload;

    if (!decodedValue || !decodedValue.user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }
    console.log("Request isauth middle : ", req.user);
    req.user = decodedValue.user;

    return next();  
  } catch (error) {
    return res.status(401).json({
      message: "Please Login - Jwt error",
    });
  }
};

export const isInternalService = (req: Request, res: Response, next: NextFunction): any => {

  const internalSecret = req.headers["x-internal-key"];

  // Check if it exists and matches your environment variable
  if (!internalSecret || internalSecret !== process.env.INTERNAL_SERVICE_KEY) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Invalid or missing internal service key",
    });
  }

  // Authentication passed, proceed to the controller
  next();
};