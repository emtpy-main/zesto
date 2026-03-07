import express from "express"
import { isAuth, isSeller } from "../middlewares/isAuth.js";
import { addMenuItem, deleteItem, getAllItem, toggleMenuItemAvailability } from "../controllers/menuItem.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post('/new',isAuth,isSeller,uploadFile,addMenuItem);
router.get('/all/:id',isAuth,getAllItem);
router.delete('/delete/:itemId',isAuth,isSeller,deleteItem);
router.put('/status/:itemId',isAuth,isSeller,toggleMenuItemAvailability);

export default router;