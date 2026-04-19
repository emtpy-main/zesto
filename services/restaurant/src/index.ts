import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv'
import restaurantRoutes from './routes/restaurant.js'
import itemRoutes from './routes/menuItem.js'
import cartRoutes from './routes/cart.js'
import addressRoutes from './routes/address.js'
import orderRoutes from './routes/order.js'
import cors from 'cors';
import { connectRabbitMQ } from './config/rabbitmq.js';
import { startPaymentConsumer } from './config/payment.consumer.js';
dotenv.config();

const app = express()

await connectRabbitMQ();
startPaymentConsumer();

const PORT = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());
app.use("/api/restaurant",restaurantRoutes);
app.use("/api/item",itemRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/address",addressRoutes);
app.use("/api/order",orderRoutes);

app.listen(PORT,()=>{
    //console.log(`restaurant service is running on port ${PORT}`);
    connectDB();    
})