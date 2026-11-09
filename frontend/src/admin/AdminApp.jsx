import { useState } from 'react';
import Logo from '../components/Logo.jsx';
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from './AdminContext.jsx';
import { Loader } from '../components/Ui.jsx';
import { Icon } from '../components/Icons.jsx';
import AdminLogin from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Properties from './pages/Properties.jsx';
import Visits from './pages/Visits.jsx';
import Inbox from './pages/Inbox.jsx';
import Orders from './pages/Orders.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import Backups from './pages/Backups.jsx';
import { Admins, Blog, Coupons, Places } from './pages/CrudPages.jsx';
import './admin.css';

// [path, label, permission]
const NAV = [
  ['/admin', 'Dashboard', null],
  ['/admin/properties', 'Properties', 'all_properties'],
  ['/admin/visits', 'Visit bookings', 'orders'],
  ['/admin/orders', 'Payments', 'orders'],
  ['/admin/inbox', 'Inbox', ['orders', 'contact_messages', 'newsletter']],
  ['/admin/places', 'Cities & areas', 'places'],
  ['/admin/coupons', 'Coupons', 'coupon'],
  ['/admin/blog', 'Blog', 'blogs'],
  ['/admin/reports', 'Reports', 'reports'],
  ['/admin/admins', 'Sub-admins', 'user_role'],
  ['/admin/settings', 'Site settings', 'site_setting'],
  ['/admin/backups', 'Backups', 'database_backup'],
];

function Shell() {
  const { admin, ready, logout, can } = useAdmin();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/admin/login') return <AdminLogin />;
  if (!ready) return <Loader />;
  if (!admin) return <Navigate to="/admin/login" replace />;

  const allowed = (perm) => (Array.isArray(perm) ? perm.some(can) : can(perm));
  const guard = (perm, el) => (allowed(perm) ? el : <p className="muted">You do not have access to this section.</p>);

  return (
    <div className="a-shell">
      <aside className={`a-side ${open ? 'open' : ''}`}>
        <Link to="/admin" className="a-brand"><Logo light /> <small>admin</small></Link>
        <nav>
          {NAV.filter(([, , perm]) => allowed(perm)).map(([to, label]) => (
            <NavLink key={to} to={to} end={to === '/admin'} onClick={() => setOpen(false)}>{label}</NavLink>
          ))}
        </nav>
        <a href="/" className="a-side-foot" target="_blank" rel="noreferrer">View public site ↗</a>
      </aside>
      {open && <div className="a-scrim" onClick={() => setOpen(false)} />}

      <div className="a-main">
        <header className="a-top">
          <button className="burger always" onClick={() => setOpen(!open)} aria-label="Menu"><Icon.Menu /></button>
          <span className="a-who">{admin.name}{!admin.is_super && <span className="badge badge-blue">Sub-admin</span>}</span>
          <button className="btn btn-outline btn-sm" onClick={async () => { await logout(); navigate('/admin/login'); }}>Sign out</button>
        </header>
        <div className="a-content">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="properties" element={guard('all_properties', <Properties />)} />
            <Route path="visits" element={guard('orders', <Visits />)} />
            <Route path="orders" element={guard('orders', <Orders />)} />
            <Route path="inbox" element={guard(['orders', 'contact_messages', 'newsletter'], <Inbox />)} />
            <Route path="places" element={guard('places', <Places />)} />
            <Route path="coupons" element={guard('coupon', <Coupons />)} />
            <Route path="blog" element={guard('blogs', <Blog />)} />
            <Route path="reports" element={guard('reports', <Reports />)} />
            <Route path="admins" element={guard('user_role', <Admins />)} />
            <Route path="settings" element={guard('site_setting', <Settings />)} />
            <Route path="backups" element={guard('database_backup', <Backups />)} />
            <Route path="*" element={<p className="muted">Page not found.</p>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AdminProvider>
      <Shell />
    </AdminProvider>
  );
}
