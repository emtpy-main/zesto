import express from "express";
import { addUserRole, googleLogin, myProfile } from "../controllers/auth.js";
import { isAuth } from "../middlewares/isAuth.js";
import { manualLogin, registerUser } from "../controllers/manualAuth.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();
router.post("/login", googleLogin);
router.post("/login/manual",manualLogin);
router.post("/new/register",uploadFile,registerUser)
router.put("/add/role", isAuth, addUserRole);
router.get("/me",isAuth,myProfile);
export default router;
