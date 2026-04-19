import express from "express"
import dotenv from "dotenv"
import cors from 'cors'
import adminRoutes from "./route/admin.js"
dotenv.config();
const app = express();
app.use(cors());
app.use('/api/v1',adminRoutes);
app.listen(process.env.PORT,()=>{
    //console.log(`Admin service is running at port ${process.env.PORT}`)
})