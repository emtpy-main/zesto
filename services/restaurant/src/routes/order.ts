import express from 'express'
import { isAuth } from '../middlewares/isAuth.js';
import { createOrder, fetchOrderforPayment } from '../controllers/order.js';

const router = express.Router();

router.post('/new',isAuth,createOrder);
router.get('/payment/:id',fetchOrderforPayment);

export default router;