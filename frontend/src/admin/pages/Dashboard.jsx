import { Link } from 'react-router-dom';
import { adm } from '../adminApi.js';
import { useFetch } from '../../hooks/useFetch.js';
import { ErrorBox, Loader } from '../../components/Ui.jsx';
import { money } from '../../utils/format.js';
import { StatCard } from '../components/AdminUi.jsx';
import { useAdmin } from '../AdminContext.jsx';

export default function Dashboard() {
  const { can } = useAdmin();
  const { data: s, loading, error, reload } = useFetch(() => adm.get('/admin/reports/summary'), []);

  if (!can('reports')) return <><div className="a-head"><h1>Dashboard</h1></div><p className="muted">Welcome! Use the menu to manage the sections you have access to.</p></>;
  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const p = s.properties;

  return (
    <>
      <div className="a-head"><h1>Dashboard</h1></div>
      <div className="stat-grid">
        <StatCard label="Pending review" value={p.pending} tone="amber" hint={<Link to="/admin/properties?status=0">Review now →</Link>} />
        <StatCard label="Published" value={p.published} tone="green" />
        <StatCard label="In progress" value={p.delivery_progress} tone="blue" />
        <StatCard label="Delivered" value={p.delivered} tone="gray" />
        <StatCard label="Cancelled" value={p.cancelled} tone="red" />
      </div>
      <div className="stat-grid">
        <StatCard label="Registered users" value={s.users} />
        <StatCard label="New inquiries" value={s.new_inquiries} tone="amber" hint={<Link to="/admin/inbox">Open inbox →</Link>} />
        <StatCard label="Paid orders" value={s.paid_orders} tone="green" />
        <StatCard label="Revenue" value={money(s.revenue)} tone="green" />
        <StatCard label="Delivered today" value={s.delivered_today} />
        <StatCard label="Delivered value this month" value={money(s.delivered_total_this_month)} />
      </div>
    </>
  );
}
