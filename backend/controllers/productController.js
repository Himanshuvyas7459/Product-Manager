import Product from "../models/productModel.js"

// Create product
const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      createdBy: req.user.id
    })

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product slug already exists"
      })
    }

    console.error("Create product error:", error.message)

    return res.status(500).json({
      success: false,
      message: "Failed to create product"
    })
  }
}

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      createdBy: req.user.id
    }).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    })
  } catch (error) {
    console.error("Get products error:", error.message)

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products"
    })
  }
}

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      createdBy: req.user.id
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }

    return res.status(200).json({
      success: true,
      product
    })
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      })
    }

    console.error("Get product error:", error.message)

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product"
    })
  }
}

// Updateproduct
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user.id
      },
      req.body,
      {
        returnDocument: "after",
        runValidators: true
      }
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product slug already exists"
      })
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      })
    }

    console.error("Update product error:", error.message)

    return res.status(500).json({
      success: false,
      message: "Failed to update product"
    })
  }
}

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id
    })

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      })
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    })
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      })
    }

    console.error("Delete product error:", error.message)

    return res.status(500).json({
      success: false,
      message: "Failed to delete product"
    })
  }
}

const productController = {createProduct, getProducts, getProductById, updateProduct, deleteProduct }

export default productController