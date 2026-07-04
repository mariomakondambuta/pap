import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { MinimalLayout } from './layouts/MinimalLayout';
import { BuyerLayout } from './layouts/BuyerLayout';
import { SellerLayout } from './layouts/SellerLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute, AdminRoute, GuestRoute } from './auth/ProtectedRoute';

import { Home } from './pages/public/Home';
import { Pricing } from './pages/public/Pricing';
import { Marketplace } from './pages/public/Marketplace';
import { ProductDetail } from './pages/public/ProductDetail';
import { VerifyCertificate } from './pages/public/VerifyCertificate';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

import { Checkout } from './pages/checkout/Checkout';
import { CheckoutSuccess } from './pages/checkout/CheckoutSuccess';
import { Lesson } from './pages/learn/Lesson';

import { BuyerHome } from './pages/buyer/BuyerHome';
import { Library } from './pages/buyer/Library';
import { Certificates } from './pages/buyer/Certificates';
import { CancelledOrders } from './pages/buyer/CancelledOrders';
import { Account } from './pages/buyer/Account';

import { SellerHome } from './pages/seller/SellerHome';
import { Products } from './pages/seller/Products';
import { Sales } from './pages/seller/Sales';
import { WalletPage } from './pages/seller/WalletPage';
import { ProductNew } from './pages/seller/ProductNew';
import { ProductEditor } from './pages/seller/ProductEditor';

import { Dashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { Transactions } from './pages/admin/Transactions';
import { Withdrawals } from './pages/admin/Withdrawals';
import { Users } from './pages/admin/Users';
import { Settings } from './pages/admin/Settings';

import { NotFound } from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/precos" element={<Pricing />} />
        <Route path="/cursos" element={<Marketplace />} />
        <Route path="/curso/:id" element={<ProductDetail />} />
        <Route path="/verificar" element={<VerifyCertificate />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registar" element={<Register />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MinimalLayout />}>
          <Route path="/checkout/:orderId" element={<Checkout />} />
          <Route path="/checkout-sucesso/:orderId" element={<CheckoutSuccess />} />
          <Route path="/aula/:id" element={<Lesson />} />
        </Route>

        <Route path="/explorar" element={<BuyerLayout />}>
          <Route index element={<Marketplace inApp />} />
        </Route>

        <Route path="/painel" element={<BuyerLayout />}>
          <Route index element={<BuyerHome />} />
          <Route path="compras" element={<Library />} />
          <Route path="certificados" element={<Certificates />} />
          <Route path="canceladas" element={<CancelledOrders />} />
          <Route path="conta" element={<Account />} />
        </Route>

        <Route path="/negocio" element={<SellerLayout />}>
          <Route index element={<SellerHome />} />
          <Route path="produtos" element={<Products />} />
          <Route path="vendas" element={<Sales />} />
          <Route path="carteira" element={<WalletPage />} />
        </Route>
        <Route path="/produto" element={<SellerLayout />}>
          <Route path="novo" element={<ProductNew />} />
          <Route path="editar" element={<ProductEditor />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="produtos" element={<AdminProducts />} />
            <Route path="transacoes" element={<Transactions />} />
            <Route path="levantamentos" element={<Withdrawals />} />
            <Route path="utilizadores" element={<Users />} />
            <Route path="definicoes" element={<Settings />} />
          </Route>
        </Route>
      </Route>

      <Route path="/certificados" element={<Navigate to="/painel/certificados" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
