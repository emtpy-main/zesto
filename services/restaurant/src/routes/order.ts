import express from 'express'
import { isAuth, isSeller } from '../middlewares/isAuth.js';
import { assignRiderToOrder, confirmDelivery, createOrder, fetchOrderforPayment, fetchRestaurantOrders, fetchSingleOrder, getCurrentOrderForRider, getMyOrders, ResendOtp, updateOrderStatus, updateOrderStatusRider } from '../controllers/order.js';

const router = express.Router();

router.get('/my',isAuth,getMyOrders);
router.post('/new',isAuth,createOrder);
router.get('/payment/:id',fetchOrderforPayment); 
router.get('/restaurant/:restaurantId',isAuth,isSeller,fetchRestaurantOrders);
router.put('/:orderId',isAuth,isSeller,updateOrderStatus)
router.get('/:id',isAuth,fetchSingleOrder);
//=== rider' calling api
router.put('/assign/rider',assignRiderToOrder)
router.get('/current/rider/:riderId',getCurrentOrderForRider)
router.put('/update/status/rider',updateOrderStatusRider) 
router.put('/update/status/rider/confirmation',confirmDelivery);
router.post('/resend-otp/:orderId',ResendOtp);


export default router;