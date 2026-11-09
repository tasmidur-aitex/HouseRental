import { useState } from 'react';
import { adm } from '../adminApi.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import Pagination from '../../components/Pagination.jsx';
import { ErrorBox, Loader } from '../../components/Ui.jsx';
import { RowActions, Table, Tabs } from '../components/AdminUi.jsx';
import { dateText, money } from '../../utils/format.js';

const TONE = { Complete: 'green', Done: 'green', Processing: 'green', Pending: 'amber', Failed: 'red', Canceled: 'gray' };
const TABS = [['', 'All'], ['Complete', 'Paid'], ['Pending', 'Pending'], ['Failed', 'Failed'], ['Canceled', 'Canceled']];

export default function Orders() {
  const toast = useToast();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, meta, loading, error, reload } = useFetch(() => adm.get('/admin/orders', { page, per_page: 15, status }), [page, status]);

  const remove = async (o) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await adm.del(`/admin/orders/${o.id}`);
      toast.success('Deleted');
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const columns = [
    { label: 'Date', render: (o) => dateText(o.created_at) },
    { label: 'Transaction', render: (o) => <code>{o.transaction_id}</code> },
    { label: 'User', render: (o) => o.user ? <>{o.user.name}<br /><small>{o.user.email}</small></> : '—' },
    { label: 'Property', render: (o) => o.property?.title || '—' },
    { label: 'Amount', render: (o) => <>{money(o.amount)}{o.coupon_code && <small className="block muted">coupon {o.coupon_code}</small>}</> },
    { label: 'Status', render: (o) => <span className={`badge badge-${TONE[o.status] || 'gray'}`}>{o.status}</span> },
    { label: '', className: 'right', render: (o) => <RowActions><button className="btn btn-ghost btn-sm danger" onClick={() => remove(o)}>Delete</button></RowActions> },
  ];

  return (
    <>
      <div className="a-head"><h1>Payments</h1></div>
      <Tabs tabs={TABS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loader /> : <Table columns={columns} rows={data || []} empty="No payments." />}
      <Pagination meta={meta} onPage={setPage} />
    </>
  );
}
