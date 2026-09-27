import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext.jsx";
import AdminOrderPage from "./pages/admin/AdminOrderPage.jsx";
import AdminPage from "./pages/admin/AdminPage.jsx";
import ProductCreatePage from "./pages/admin/ProductCreatePage.jsx";
import ProductListPage from "./pages/admin/ProductListPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OrderDetailPage from "./pages/OrderDetailPage.jsx";
import OrderListPage from "./pages/OrderListPage.jsx";
import OrderSuccessPage from "./pages/OrderSuccessPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import "./App.css";
import "./pages/HomePage.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="/orders/:id/success" element={<OrderSuccessPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/orders" element={<AdminOrderPage />} />
          <Route path="/admin/products" element={<ProductListPage />} />
          <Route path="/admin/products/new" element={<ProductCreatePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
