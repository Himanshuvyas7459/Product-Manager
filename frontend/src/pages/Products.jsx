import { useCallback, useEffect, useState } from "react"
import {useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"
import {Plus, Search, Pencil, Trash2, X,Package, LogOut, Image as ImageIcon, Eye} from "lucide-react"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import {ClassicEditor,Essentials,Paragraph,Bold,Italic, Heading,Link as LinkPlugin, List } from "ckeditor5"
import API from "../services/api"

import "ckeditor5/ckeditor5.css";


const initialForm = { metaTitle: "", name: "", slug: "", galleryImages: "", price: "", discountedPrice: "",description: ""};

const Products = () => {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  // fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)

      const { data } = await API.get("/products")

      const productList = Array.isArray(data)
        ? data
        : data.products || [];

      setProducts(productList)
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not load products"
      )

      if (error.response?.status === 401) {
        localStorage.removeItem("token")
        navigate("/login", { replace: true })
      }
    } finally {
      setLoading(false);
    }
  }, [navigate])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  };

  // Open form for add product
  const handleAdd = () => {
    setForm({ ...initialForm });
    setEditingId(null);
    setShowForm(true);
  }

  const handleEdit = (product) => {
    setEditingId(product._id)

    setForm({
      metaTitle: product.metaTitle || "",
      name: product.name || "",
      slug: product.slug || "",
      galleryImages: (product.galleryImages || []).join("\n"),
      price: product.price ?? "",
      discountedPrice: product.discountedPrice ?? "",
      description: product.description || ""
    })

    setShowForm(true);
  }

  // Save product or update
  const handleSubmit = async (e) => {
    e.preventDefault()

    const price = Number(form.price)
    const discountedPrice = Number(form.discountedPrice)

    if (discountedPrice > price) {
      toast.error("Discounted price cannot be greater than price")
      return
    }

    
const payload = {
  ...form,
  price,
  discountedPrice,
  galleryImages: form.galleryImages
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean)
}

    try {
      setSaving(true)

      if (editingId) {
        await API.put(`/products/${editingId}`, payload)
        toast.success("Product updated successfully")
      } else {
        await API.post("/products", payload)
        toast.success("Product added successfully")
      }

      setShowForm(false)
      setForm({ ...initialForm });
      setEditingId(null)

      await fetchProducts()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to save product"
      )
    } finally {
      setSaving(false)
    }
  };

  // delete product
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/products/${id}`)

      toast.success("Product deleted successfully");

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product._id !== id)
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to delete product"
      )
    }
  }

  // Log out and return to login
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully")
    navigate("/login", { replace: true })
  }

  // Search by product name, meta title, or slug
  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase();

    return (
      product.name?.toLowerCase().includes(query) ||
      product.metaTitle?.toLowerCase().includes(query) ||
      product.slug?.toLowerCase().includes(query)
    )
  })

  const getImage = (product) => product.galleryImages?.[0] || ""

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">

            <div>
              <h1 className="text-lg font-bold text-slate-800">
                Product Manager
              </h1>
              <p className="text-xs text-slate-500">
                Product Management System
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            <LogOut size={17} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Products
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your product inventory in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Search and product count */}
        <div className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-md">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
              className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <p className="text-sm text-slate-500">
            Total products:{" "}
            <span className="font-bold text-slate-800">
              {products.length}
            </span>
          </p>
        </div>

        {/* Products list */}
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white py-20 text-center">
            <p className="text-slate-500">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <Package
              size={42}
              className="mx-auto mb-4 text-slate-300"
            />

            <h3 className="text-lg font-semibold text-slate-800">
              {search ? "No matching products" : "No products yet"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "Try another search term."
                : "Add your first product to get started."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={handleAdd}
                className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
              >
                Add your first product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">
                      Product
                    </th>
                    <th className="px-6 py-4 font-semibold">Slug</th>
                    <th className="px-6 py-4 font-semibold">Price</th>
                    <th className="px-6 py-4 font-semibold">
                      Discount
                    </th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getImage(product) ? (
                            <img
                              src={getImage(product)}
                              alt={product.name}
                              className="h-14 w-14 rounded-lg border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                              <ImageIcon size={22} />
                            </div>
                          )}

                          <div>
                            <p className="font-semibold text-slate-800">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {product.metaTitle}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {product.slug}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4 text-sm text-emerald-600">
                        ₹
                        {Number(
                          product.discountedPrice
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/products/${product._id}`}
                            aria-label={`View ${product.name}`}
                            title="View product"
                            className="rounded-lg p-2 text-emerald-600 transition hover:bg-emerald-50"
                          >
                            <Eye size={18} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            aria-label={`Edit ${product.name}`}
                            title="Edit product"
                            className="rounded-lg p-2 text-indigo-600 cursor-pointer transition hover:bg-indigo-50"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(product._id)}
                            aria-label={`Delete ${product.name}`}
                            title="Delete product"
                            className="rounded-lg p-2 cursor-pointer text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
{/* edit/add */}
      {showForm && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-slate-900/50 px-4 py-8">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
            className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h3
                  id="product-form-title"
                  className="text-xl font-bold text-slate-800"
                >
                  {editingId ? "Edit Product" : "Add New Product"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the product details below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Product Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Product Name *
                </label>

                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  placeholder="e.g. Wireless Headphones"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Meta Title */}
              <div>
                <label
                  htmlFor="metaTitle"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Meta Title *
                </label>

                <input
                  id="metaTitle"
                  name="metaTitle"
                  value={form.metaTitle}
                  onChange={handleChange}
                  required
                  maxLength={60}
                  placeholder="SEO title (max 60 characters)"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.metaTitle.length}/60
                </p>
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Slug *
                </label>

                <input
                  id="slug"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  required
                  maxLength={180}
                  placeholder="wireless-headphones"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Prices */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Price (₹) *
                  </label>

                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                    placeholder="1999"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="discountedPrice"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Discounted Price (₹) *
                  </label>

                  <input
                    id="discountedPrice"
                    name="discountedPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discountedPrice}
                    onChange={handleChange}
                    required
                    placeholder="1499"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Gallery image */}
              <div>
                <label
                  htmlFor="galleryImages"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Gallery Image URLs *
                </label>

                <textarea
                  id="galleryImages"
                  name="galleryImages"
                  value={form.galleryImages}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Paste image URLs, one per line"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-1 text-xs text-slate-500">
                  Enter valid image URLs, one per line.
                </p>
              </div>

              {/* Rich Text */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Product Description
                </label>

                <div className="rounded-lg border border-gray-300 bg-white">
                  <CKEditor
                    editor={ClassicEditor}
                    config={{
                      licenseKey: "GPL",
                      plugins: [ Essentials, Paragraph, Bold, Italic, Heading, LinkPlugin, List ],
                      toolbar: ["undo","redo","|","heading","|","bold","italic","link","|","bulletedList","numberedList",]
                    }}
                    data={form.description || ""}
                    onChange={(event, editor) => {
                      setForm((prev) => ({
                        ...prev,
                        description: editor.getData()
                      }))
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Add product details using headings, formatting, and lists.
                </p>
              </div>

              {/* Form Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg cursor-pointer border border-slate-300 px-5 py-3 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg cursor-pointer bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Product"
                    : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products