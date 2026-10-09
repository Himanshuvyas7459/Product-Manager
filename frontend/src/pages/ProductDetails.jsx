import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast"
import API from "../services/api"

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState("")
  const [loading, setLoading] = useState(true)

  // get product
  useEffect(() => {
    const getProduct = async () => {
      try {
        const response = await API.get(`/products/${id}`)

        const productData = response.data.product || response.data

        setProduct(productData)

        // Show the first image by default
        if (productData.galleryImages?.length > 0) {
          setSelectedImage(productData.galleryImages[0])
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load product"
        );
      } finally {
        setLoading(false)
      }
    };

    getProduct()
  }, [id])

  //loading message
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Loading product...
      </div>
    )
  }

//massage not found
  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-xl font-bold text-gray-800">
          Product not found
        </h2>

        <Link
          to="/products"
          className="rounded-lg cursor-pointer bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700"
        >
          Back to Products
        </Link>
      </div>
    )
  }

  const images = product.galleryImages || []
  const price = Number(product.price)
  const discountedPrice = Number(product.discountedPrice)

  const hasDiscount =
    discountedPrice > 0 && discountedPrice < price;

  const discount = hasDiscount
    ? Math.round(((price - discountedPrice) / price) * 100)
    : 0

  const formatPrice = (amount) => {
    return amount.toLocaleString("en-IN");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Back button */}
        <Link
          to="/products"
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back to Products
        </Link>

        <div className="grid gap-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-2 md:p-8">

          {/* Product images */}
          <div>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-gray-100">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-contain"
                  onError={() => setSelectedImage("")}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ImageIcon size={48} />
                  <span>No image available</span>
                </div>
              )}
            </div>

            {/* Image Slides */}
            {images.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selectedImage === image}
                    className={`h-20 w-20 overflow-hidden rounded-lg border-2 bg-white transition ${
                      selectedImage === image
                        ? "border-indigo-600 ring-2 ring-indigo-100"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}>
                    <img
                      src={image}
                      alt={`${product.name} image ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Product Details
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900">
              {product.name}
            </h1>

            <p className="mt-3 break-all text-sm text-gray-500">
              Slug: {product.slug}
            </p>

            {/* Price or discount */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {hasDiscount ? (
                <>
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{formatPrice(discountedPrice)}
                  </span>

                  <span className="text-lg text-gray-400 line-through">
                    ₹{formatPrice(price)}
                  </span>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    {discount}% OFF
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  ₹{formatPrice(price)}
                </span>
              )}
            </div>

            {/* description */}
            <div className="mt-8 border-t border-gray-100 pt-6">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Description
              </h2>

              <div
  className="product-description break-words text-sm leading-7 text-gray-600
    [&_h1]:mb-3 [&_h1]:mt-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:leading-tight
    [&_h2]:mb-3 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:leading-snug
    [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:leading-snug
    [&_h4]:mb-2 [&_h4]:mt-3 [&_h4]:text-base [&_h4]:font-semibold
    [&_p]:mb-3
    [&_ul]:mb-3 [&_ul]:ml-6 [&_ul]:list-disc
    [&_ol]:mb-3 [&_ol]:ml-6 [&_ol]:list-decimal
    [&_li]:mb-1
    [&_strong]:font-bold"
  dangerouslySetInnerHTML={{
    __html: product.description || "No description available.",
  }}
/>
</div>

            {/* meta title */}
            <div className="mt-8 rounded-xl bg-indigo-50 p-4">
              <p className="text-sm font-medium text-indigo-900">
                Product Meta Title
              </p>

              <p className="mt-1 text-sm text-indigo-700">
                {product.metaTitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails


