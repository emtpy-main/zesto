import express from 'express'
import { isAdmin, isAuth } from '../middleware/isAuth.js';
import { getPendingRestaurants, getPendingRiders, verifyRestaurant, verifyRider } from '../contollers/admin.js';

const router = express.Router();
router.get("/admin/restaurant/pending",isAuth,isAdmin,getPendingRestaurants);
router.get("/admin/rider/pending",isAuth,isAdmin,getPendingRiders);
router.put("/admin/verify/rider/:id",isAuth,isAdmin,verifyRider);
router.put("/admin/verify/restaurant/:id",isAuth,isAdmin,verifyRestaurant);
export default router;