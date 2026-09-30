import Joi from "joi"

const productSchema = Joi.object({
  metaTitle: Joi.string().trim().min(3).max(60).required(),

  name: Joi.string().trim().min(2).max(150).required(),

  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(180)
    .required()
    .messages({
      "string.pattern.base":
        "Slug must contain lowercase letters, numbers and hyphens only"
    }),

  galleryImages: Joi.array()
    .items(Joi.string().uri({ scheme: ["http", "https"] }).max(2048))
    .min(1)
    .max(10)
    .required(),

  price: Joi.number().positive().required(),

  discountedPrice: Joi.number().min(0).required(),

  description: Joi.string().trim().min(10).max(20000).required()
})
  .custom((value, helpers) => {
    if (value.discountedPrice > value.price) {
      return helpers.error("any.invalid")
    }

    return value
  })
  .messages({
    "any.invalid": "Discounted price cannot exceed original price"
  })

const validateProduct = (req, res, next) => {
  const { error, value } = productSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  })

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map(item => item.message)
    })
  }

  req.body = value
  next()
}

export default validateProduct