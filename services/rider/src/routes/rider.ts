import express from 'express'
import { isAuth, isRider } from '../middlewares/isAuth.js';
import { acceptOrder, addRiderProfile, confirmOrderStatus, fetchMyCurrentOrder, fetchMyProfile, ResendOtp, toggleRiderAvailablity, updateOrderStatus } from '../controllers/rider.js';
import uploadFile from '../middlewares/multer.js';

const router = express.Router();

router.get('/myprofile',isAuth,isRider,fetchMyProfile);
router.put("/toggle",isAuth,isRider,toggleRiderAvailablity);
router.post("/new",isAuth,isRider,uploadFile,addRiderProfile);
router.post('/accept/:orderId',isAuth,isRider,acceptOrder);
router.get("/order/current",isAuth,isRider,fetchMyCurrentOrder)
router.put("/order/update/:orderId",isAuth,isRider,updateOrderStatus);
router.put("/order/update/confirmation/:orderId",isAuth,isRider,confirmOrderStatus);
router.post("/order/resend-otp/:orderId",isAuth,isRider,ResendOtp);
export default router;