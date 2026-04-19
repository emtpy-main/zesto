import express, { Request, Response } from "express";
import { addUserRole, googleLogin, myProfile } from "../controllers/auth.js";
import { isAuth, isInternalService } from "../middlewares/isAuth.js";
import { manualLogin, registerUser } from "../controllers/manualAuth.js";
import uploadFile from "../middlewares/multer.js";
import User from "../model/User.js";

const router = express.Router();
router.post("/login", googleLogin);
router.post("/login/manual", manualLogin);
router.post("/new/register", uploadFile, registerUser);
router.put("/add/role", isAuth, addUserRole);
router.get("/me", isAuth, myProfile);
// internal api to get user email and name form email services in otp from restaurant service in auth service
router.get("/internal/v1/profile/:id", isInternalService, async (req: Request, res: Response): Promise<any> => {
  try { 
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to fetch profile",
      });
    }
 
    const user = await User.findById(id);
 
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
 
    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: {
        name: user.name,
        email: user.email,
      }
    });

  } catch (error) {
    console.error("Fetch Profile Error:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});
export default router;
