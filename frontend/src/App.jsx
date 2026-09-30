import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast"

import Login from "./pages/Login";
import Signup from "./pages/Signup"
import ProtectedRoute from "./components/ProtectedRoute"
import Products from "./pages/Products"
import ProductDetails from "./pages/ProductDetails"

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protect */}
        <Route element={<ProtectedRoute />}>
  <Route path="/products" element={<Products />} />
  <Route path="/products/:id" element={<ProductDetails />}/>
</Route>


        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App