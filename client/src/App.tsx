import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminOrderListPage from "./pages/admin/AdminOrderListPage";
import AdminProductListPage from "./pages/admin/AdminProductListPage";
import AdminProductEditPage from "./pages/admin/AdminProductEditPage";
import AdminPromotionListPage from "./pages/admin/AdminPromotionListPage";
import AdminPromotionEditPage from "./pages/admin/AdminPromotionEditPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:id" element={<OrderDetailsPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/orders" element={<AdminOrderListPage />} />
        <Route path="/admin/products" element={<AdminProductListPage />} />
        <Route path="/admin/products/create" element={<AdminProductEditPage />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductEditPage />} />
        <Route path="/admin/promotions" element={<AdminPromotionListPage />} />
        <Route path="/admin/promotions/create" element={<AdminPromotionEditPage />} />
        <Route path="/admin/promotions/:id/edit" element={<AdminPromotionEditPage />} />
      </Routes>
    </Router>
  );
}

export default App;
