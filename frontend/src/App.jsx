import { Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Properties from './pages/Properties.jsx';
import PropertyDetails from './pages/PropertyDetails.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Wishlist from './pages/Wishlist.jsx';
import AddProperty from './pages/AddProperty.jsx';
import MyProperties from './pages/MyProperties.jsx';
import MyOrders from './pages/MyOrders.jsx';
import Profile from './pages/Profile.jsx';
import { Blog, BlogPost, Contact, NotFound, PaymentResult } from './pages/Misc.jsx';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  const { pathname } = useLocation();
  const bare = pathname === '/login' || pathname === '/register'; // auth pages have their own layout

  return (
    <>
      <ScrollTop />
      {!bare && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/payment/:result" element={<PaymentResult />} />

          <Route path="/wishlist" element={guard(<Wishlist />)} />
          <Route path="/my/properties" element={guard(<MyProperties />)} />
          <Route path="/my/properties/new" element={guard(<AddProperty />)} />
          <Route path="/my/orders" element={guard(<MyOrders />)} />
          <Route path="/profile" element={guard(<Profile />)} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!bare && <Footer />}
    </>
  );
}
