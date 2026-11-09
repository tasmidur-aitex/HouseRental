import { useState } from 'react';
import { adm } from '../adminApi.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import Pagination from '../../components/Pagination.jsx';
import { ErrorBox, Loader } from '../../components/Ui.jsx';
import { PageHead, RowActions, Table, Tabs, Toolbar } from '../components/AdminUi.jsx';
import { prettyDate, prettyTime, VISIT_TONE } from '../../pages/MyVisits.jsx';

const TABS = [['', 'All'], ['pending', 'Pending'], ['confirmed', 'Confirmed'], ['completed', 'Completed'], ['cancelled', 'Cancelled']];

export default function Visits() {
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const { data, meta, loading, error, reload } = useFetch(() => adm.get('/admin/visits', { page, per_page: 15, status, date }), [page, status, date]);

  const update = async (v, body) => {
    try {
      await adm.patch(`/admin/visits/${v.id}`, body);
      toast.success('Visit updated');
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  };
  const withNote = (v, status) => {
    const note = window.prompt(status === 'cancelled' ? 'Reason for the visitor (optional):' : 'Note for the visitor (optional):', v.admin_note || '');
    if (note === null) return;
    update(v, { status, admin_note: note });
  };

  const columns = [
    { label: 'When', render: (v) => <><strong>{prettyDate(v.visit_date)}</strong><br /><small>{prettyTime(v.visit_time)}</small></> },
    { label: 'Property', render: (v) => <><strong>{v.property?.title}</strong><br /><small>{v.property?.code}</small></> },
    { label: 'Visitor', render: (v) => <>{v.name}<br /><small>{v.phone} · {v.email}</small>{v.message && <><br /><small className="muted">“{v.message}”</small></>}</> },
    { label: 'Status', render: (v) => <><span className={`badge badge-${VISIT_TONE[v.status]}`}>{v.status}</span>{v.admin_note && <small className="block muted">{v.admin_note}</small>}</> },
    { label: '', className: 'right', render: (v) => (
      <RowActions>
        {v.status === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => withNote(v, 'confirmed')}>Confirm</button>}
        {v.status === 'confirmed' && <button className="btn btn-primary btn-sm" onClick={() => update(v, { status: 'completed' })}>Mark done</button>}
        {['pending', 'confirmed'].includes(v.status) && <button className="btn btn-ghost btn-sm danger" onClick={() => withNote(v, 'cancelled')}>Cancel</button>}
      </RowActions>) },
  ];

  return (
    <>
      <PageHead title="Visit bookings" subtitle="Confirm or cancel the visits people have requested." />
      <Tabs tabs={TABS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
      <Toolbar>
        <label className="inline-field">Date <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} /></label>
        {date && <button className="btn btn-ghost btn-sm" onClick={() => setDate('')}>Clear date</button>}
      </Toolbar>
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loader /> : <Table columns={columns} rows={data || []} empty="No visits in this view." />}
      <Pagination meta={meta} onPage={setPage} />
    </>
  );
}
