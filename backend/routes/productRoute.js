import express from "express";
import {
  listProduct,
  addProduct,
  removeProduct,
  singleProduct,
  updateProductStock,
} from "../controllers/productController.js";
import { uploadDisk } from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

productRouter.post(
  "/add",
  adminAuth,
  uploadDisk.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
    { name: "image5", maxCount: 1 },
    { name: "image6", maxCount: 1 },
    { name: "image7", maxCount: 1 },
  ]),
  addProduct
);

productRouter.post("/remove", adminAuth, removeProduct);
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProduct);

/* ✅ NEW ROUTE FOR RESTOCK */
productRouter.post("/update-stock", adminAuth, updateProductStock);

export default productRouter;
