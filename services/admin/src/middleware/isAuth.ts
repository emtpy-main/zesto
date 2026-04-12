import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
export interface IUser {
  name: string;
  email: string;
  image: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
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
      process.env.JWT_SEC as string,
    ) as JwtPayload;

    if (!decodedValue || !decodedValue.user) {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    req.user = decodedValue.user;

    return next(); // optional but clean
  } catch (error) {
    return res.status(401).json({
      message: "Please Login - Jwt error",
    });
  }
};

export const isAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if(!req.user){
      res.status(401).json({
        message:"Please login"
      })
    }
    if(req.user?.role != "admin"){
      res.status(403).json({
        message:"Access denied"
      })
    }
    next();
  } catch (error) {
     res.status(401).json({
        message:"Please login"
      })
  }
};

