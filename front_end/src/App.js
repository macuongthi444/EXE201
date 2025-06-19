import { useEffect } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import Homepage from "./pages/Home/Homepage";
import LoginPage from "./pages/Login/Login";
import RegisterPage from "./pages/Register/Register";
import Footer from "./components/Footer";
import Header from "./components/Header";
import IntroductionSection from './components/IntroductionSection';
import ProductDetail from "./pages/ProductDetail/ProductDetail";
import ShopDetail from "./pages/ShopDetail/ShopDetail";
import UserProfile from "./pages/UserProfile/UserProfile";
import Categories from "./pages/Categories/Categories";
import Cart from "./pages/cart/Cart";
import CheckoutPage from "./pages/checkout/Checkout";
import SellerDashboard from "./Seller/SellerDashboard";
import ProductList from "./Seller/ProductList";
import AddProduct from "./Seller/AddProduct";
import DiscountProducts from "./Seller/DiscountProduct";
import AddDiscount from "./Seller/AddDiscount";
import AllDiscounts from "./Seller/AllDiscount";
import InventoryStock from "./Seller/InventoryStock";
import ImportHistory from "./Seller/ImportHistory";
import AddStock from "./Seller/AddStock";
import RegisteredUsers from "./Seller/RegistedUser";
import AllOrders from "./Seller/AllOrder";
import ShopRegistration from "./sellerRegistration/ShopRegistration";
import ForgotPassword from './forgotPassword/ForgotPassword';
import ResetPassword from './forgotPassword/ResetPassword';
import AdminLayout from './admin/AdminLayout';
import ChatBot from './chatbot/ChatBot';
import StoreRequestsPage from './admin/store/StoreRequestsPage';
import { AuthProvider } from './pages/Login/context/AuthContext';
import ProtectedRoute, { AdminRoute, SellerRoute } from './route/ProtectedRoute';
import MyShop from './Seller/MyShop';
import OrderConfirmation from './pages/orderConfirm/OrderConfirmation';
import PaymentCallback from './pages/checkout/payment/PaymentCallback';
import MessageBubble from './pages/UserProfile/components/messageBubble';
import RoleRedirect from './route/RoleRedirect';
import SellerSettings from './Seller/SellerChangePassword';
import ProductReviews from './Seller/ProductReview';
import ReviewDetail from './Seller/ReviewDetails';
import ShopRevenueDashboard from './Seller/ShopRevenueDashboard';
import BankAccountManagement from './Seller/BankAccountManagement';

function App() {
  const location = useLocation();

  const noHeaderPaths = ['/register', '/login', '/admin', '/forgot-password', '/reset-password'];
  const noHeaderPage = noHeaderPaths.includes(location.pathname) || location.pathname.startsWith('/admin/');

  const noRedirectPaths = ['/login', '/register', '/admin', '/seller-dashboard', '/forgot-password', '/reset-password'];
  const shouldRedirect = !noRedirectPaths.includes(location.pathname) &&
    !location.pathname.startsWith('/admin/') &&
    !location.pathname.startsWith('/seller-dashboard/');

  // Google Tag Manager script integration
 // Google Analytics (gtag.js) integration
  useEffect(() => {
    // Tạo script cho gtag.js
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-M6PEXL46GJ';
    document.head.appendChild(gtagScript);

    // Tạo script inline cho gtag
    const inlineScript = document.createElement('script');
    inlineScript.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-M6PEXL46GJ');
    `;
    document.head.appendChild(inlineScript);

    // Cleanup cả hai script
    return () => {
      document.head.removeChild(gtagScript);
      document.head.removeChild(inlineScript);
    };
  }, []);

  return (
    <div className="font-bold">
      <AuthProvider>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/gtag/js?id=G-TZ2EV99J6D"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        
        <main className={`main-content ${noHeaderPage ? 'no-header' : ''}`}>
          {!noHeaderPage && <Header />}
          <Routes>
            {/* Public routes with role redirection */}
            <Route path="/" element={
              shouldRedirect ? (
                <RoleRedirect>
                  <Homepage />
                </RoleRedirect>
              ) : (
                <Homepage />
              )
            } />
            <Route path="/introduction" element={
              shouldRedirect ? (
                <RoleRedirect>
                  <IntroductionSection />
                </RoleRedirect>
              ) : (
                <IntroductionSection />
              )
            } />
            <Route path="/product-detail" element={
              shouldRedirect ? (
                <RoleRedirect>
                  <ProductDetail />
                </RoleRedirect>
              ) : (
                <ProductDetail />
              )
            } />
            <Route path="/shop-detail" element={
              shouldRedirect ? (
                <RoleRedirect>
                  <ShopDetail />
                </RoleRedirect>
              ) : (
                <ShopDetail />
              )
            } />
            <Route path="/categories" element={
              shouldRedirect ? (
                <RoleRedirect>
                  <Categories />
                </RoleRedirect>
              ) : (
                <Categories />
              )
            } />

            {/* Public routes without role redirection */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/shop-registration" element={<ShopRegistration />} />
            <Route path="/payment-callback" element={<PaymentCallback />} />

            {/* Protected routes - require authentication */}
            <Route path="/user-profile/*" element={
              <ProtectedRoute>
                {shouldRedirect ? (
                  <RoleRedirect>
                    <UserProfile />
                  </RoleRedirect>
                ) : (
                  <UserProfile />
                )}
              </ProtectedRoute>
            } />
            <Route path="/order-confirmation" element={
              <ProtectedRoute>
                {shouldRedirect ? (
                  <RoleRedirect>
                    <OrderConfirmation />
                  </RoleRedirect>
                ) : (
                  <OrderConfirmation />
                )}
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                {shouldRedirect ? (
                  <RoleRedirect>
                    <Cart />
                  </RoleRedirect>
                ) : (
                  <Cart />
                )}
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                {shouldRedirect ? (
                  <RoleRedirect>
                    <CheckoutPage />
                  </RoleRedirect>
                ) : (
                  <CheckoutPage />
                )}
              </ProtectedRoute>
            } />

            {/* Admin routes - require admin role */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            } />

            {/* Seller routes - require seller/mod role */}
            <Route path="/seller-dashboard" element={
              <SellerRoute>
                <SellerDashboard />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/product" element={
              <SellerRoute>
                <ProductList />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/add-product" element={
              <SellerRoute>
                <AddProduct />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/discount-product" element={
              <SellerRoute>
                <DiscountProducts />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/add-discount" element={
              <SellerRoute>
                <AddDiscount />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/discounts" element={
              <SellerRoute>
                <AllDiscounts />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/inventory-stock" element={
              <SellerRoute>
                <InventoryStock />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/import-history" element={
              <SellerRoute>
                <ImportHistory />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/create-import" element={
              <SellerRoute>
                <AddStock />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/registed-user" element={
              <SellerRoute>
                <RegisteredUsers />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/orders" element={
              <SellerRoute>
                <AllOrders />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/my-shop" element={
              <SellerRoute>
                <MyShop />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/settings" element={
              <SellerRoute>
                <SellerSettings />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/reviews" element={
              <SellerRoute>
                <ProductReviews />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/reviews/:id" element={
              <SellerRoute>
                <ReviewDetail />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/revenue" element={
              <SellerRoute>
                <ShopRevenueDashboard />
              </SellerRoute>
            } />
            <Route path="/seller-dashboard/bank-account" element={
              <SellerRoute>
                <BankAccountManagement />
              </SellerRoute>
            } />

            {/* Catch-all route for 404 pages */}
            <Route path="*" element={
              shouldRedirect ? (
                <RoleRedirect>
                  <div className="text-center p-20">Page not found</div>
                </RoleRedirect>
              ) : (
                <div className="text-center p-20">Page not found</div>
              )
            } />
          </Routes>
          {!noHeaderPage && <Footer />}
          <ChatBot />
          <MessageBubble />
        </main>
      </AuthProvider>
    </div>
  );
}

export default App;