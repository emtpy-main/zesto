import express from "express"; 
import { GenerateOtp, VerifyOtp } from "../controller/otp.js";
import { isInternalService } from "../middleware/isAuth.js";

const router = express.Router();
 
router.post("/generate", isInternalService, GenerateOtp);

// Same here
router.post("/verify", isInternalService, VerifyOtp);

export default router;