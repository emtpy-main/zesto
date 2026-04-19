import { Request, Response, NextFunction } from "express";

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