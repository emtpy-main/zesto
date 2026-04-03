import Razorpay from 'razorpay';
import dotenv from 'dotenv' 
dotenv.config();
export const razorpay = new Razorpay({
    key_id:process.env.TEST_RAZORPAY_API_KEY!,
    key_secret : process.env.TEST_RAZORPAY_KEY_SECRET!
})