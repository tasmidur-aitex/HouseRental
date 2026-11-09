import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdmin } from '../AdminContext.jsx';
import { Field } from '../../components/Ui.jsx';
import { Icon } from '../../components/Icons.jsx';
import { usePageMeta } from '../../hooks/usePageMeta.js';

export default function AdminLogin() {
  const { admin, login } = useAdmin();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  usePageMeta('Admin sign in');
  if (admin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await login(form);
      navigate('/admin', { replace: true });
    } catch (error) {
      setErr(error);
      setBusy(false);
    }
  };

  return (
    <div className="a-login">
      <form className="card a-login-card" onSubmit={submit}>
        <span className="brand-mark big dark"><Icon.Home width={26} height={26} /></span>
        <h1>Admin sign in</h1>
        <p className="muted">Bariwala control panel</p>
        {err && !err.errors && <div className="alert alert-error">{err.message}</div>}
        <Field label="Email" error={err?.field('email')}><input type="email" required autoFocus autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Password" error={err?.field('password')}><input type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
