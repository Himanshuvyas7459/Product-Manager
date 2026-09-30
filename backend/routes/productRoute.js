import express from "express"

import productController from "../controllers/productController.js";
import protect from "../middleware/authMiddleware.js"
import validateProduct from "../validators/productValidator.js"

const router = express.Router()

router.use(protect);

router
  .route("/")
  .post(validateProduct, productController.createProduct)
  .get(productController.getProducts)

router
  .route("/:id")
  .get(productController.getProductById)
  .put(validateProduct, productController.updateProduct)
  .delete(productController.deleteProduct)

export default router