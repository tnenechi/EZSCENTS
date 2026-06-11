import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CollectionsPage from "./pages/CollectionsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminOrderListPage from "./pages/admin/AdminOrderListPage";
import AdminProductListPage from "./pages/admin/AdminProductListPage";
import AdminProductEditPage from "./pages/admin/AdminProductEditPage";
import AdminPromotionListPage from "./pages/admin/AdminPromotionListPage";
import AdminPromotionEditPage from "./pages/admin/AdminPromotionEditPage";
import AdminSecurityPage from "./pages/admin/AdminSecurityPage";
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/cartStore";
import { useThemeStore } from "./store/themeStore";
import ScrollToTop from "./components/layout/ScrollToTop";

function App() {
  const userInfo = useAuthStore((state) => state.userInfo);
  const setItems = useCartStore((state) => state.setItems);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const cartKey = userInfo ? `cart_${userInfo._id}` : 'cart_guest';
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, [userInfo, setItems]);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<CollectionsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:id" element={<OrderDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/orders" element={<AdminOrderListPage />} />
        <Route path="/admin/products" element={<AdminProductListPage />} />
        <Route path="/admin/products/create" element={<AdminProductEditPage />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductEditPage />} />
        <Route path="/admin/promotions" element={<AdminPromotionListPage />} />
        <Route path="/admin/promotions/create" element={<AdminPromotionEditPage />} />
        <Route path="/admin/promotions/:id/edit" element={<AdminPromotionEditPage />} />
        <Route path="/admin/security" element={<AdminSecurityPage />} />
      </Routes>
    </Router>
  );
}

export default App;
