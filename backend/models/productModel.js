import mongoose from "mongoose"

const productSchema = new mongoose.Schema(
  {
    metaTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 180
    },

    galleryImages: {
      type: [String],
      required: true,
      validate: {
        validator: images =>
          images.length >= 1 && images.length <= 10,
        message: "Add between 1 and 10 gallery images"
      }
    },

    price: {
      type: Number,
      required: true,
      min: 0.01
    },

    discountedPrice: {
      type: Number,
      required: true,
      min: 0
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20000
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
)

productSchema.index({ name: "text", metaTitle: "text" })

const Product = mongoose.model("Product", productSchema)

export default Product