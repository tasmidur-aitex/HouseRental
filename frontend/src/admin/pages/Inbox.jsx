import { useState } from 'react';
import { adm } from '../adminApi.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAdmin } from '../AdminContext.jsx';
import Pagination from '../../components/Pagination.jsx';
import { ErrorBox, Loader } from '../../components/Ui.jsx';
import { PageHead, RowActions, Table, Tabs } from '../components/AdminUi.jsx';
import { dateText } from '../../utils/format.js';

function useList(endpoint, deps = []) {
  const [page, setPage] = useState(1);
  const state = useFetch(() => adm.get(endpoint, { page, per_page: 15 }), [endpoint, page, ...deps]);
  return { ...state, page, setPage };
}

function Panel({ list, columns, empty }) {
  return (
    <>
      <ErrorBox error={list.error} onRetry={list.reload} />
      {list.loading && !list.data ? <Loader /> : <Table columns={columns} rows={list.data || []} empty={empty} />}
      <Pagination meta={list.meta} onPage={list.setPage} />
    </>
  );
}

export default function Inbox() {
  const toast = useToast();
  const { can } = useAdmin();
  const tabs = [
    can('orders') && ['inquiries', 'Property requests'],
    can('contact_messages') && ['contacts', 'Contact messages'],
    can('newsletter') && ['newsletters', 'Newsletter'],
  ].filter(Boolean);
  const [tab, setTab] = useState(tabs[0]?.[0] || 'inquiries');
  const inquiries = useList('/admin/inquiries', [tab]);
  const contacts = useList('/admin/contacts', [tab]);
  const newsletters = useList('/admin/newsletters', [tab]);

  const call = async (fn, list, ok) => {
    try {
      await fn();
      toast.success(ok);
      list.reload();
    } catch (e) {
      toast.error(e.message);
    }
  };
  const del = (path, list) => window.confirm('Delete this item?') && call(() => adm.del(path), list, 'Deleted');

  const inquiryCols = [
    { label: 'Date', render: (r) => dateText(r.created_at) },
    { label: 'From', render: (r) => <><strong>{r.name}</strong><br /><small>{r.phone} · {r.email}</small></> },
    { label: 'Property', render: (r) => r.property_code },
    { label: 'Message', render: (r) => r.message || '—' },
    { label: 'Status', render: (r) => <span className={`badge badge-${r.is_read ? 'gray' : 'amber'}`}>{r.is_read ? 'Seen' : 'New'}</span> },
    { label: '', className: 'right', render: (r) => (
      <RowActions>
        <button className="btn btn-outline btn-sm" onClick={() => call(() => adm.patch(`/admin/inquiries/${r.id}`, { is_read: !r.is_read }), inquiries, 'Updated')}>{r.is_read ? 'Mark new' : 'Mark seen'}</button>
        <button className="btn btn-ghost btn-sm danger" onClick={() => del(`/admin/inquiries/${r.id}`, inquiries)}>Delete</button>
      </RowActions>) },
  ];
  const contactCols = [
    { label: 'Date', render: (r) => dateText(r.created_at) },
    { label: 'From', render: (r) => <><strong>{r.name}</strong><br /><small>{r.phone} · {r.email}</small></> },
    { label: 'Message', render: (r) => <><strong>{r.subject}</strong><p className="clamp-2">{r.message}</p></> },
    { label: 'Status', render: (r) => <><span className={`badge badge-${r.is_read ? 'gray' : 'amber'}`}>{r.is_read ? 'Read' : 'Unread'}</span>{r.show_as_review && <span className="badge badge-green">Review</span>}</> },
    { label: '', className: 'right', render: (r) => (
      <RowActions>
        <button className="btn btn-outline btn-sm" onClick={() => call(() => adm.patch(`/admin/contacts/${r.id}`, { is_read: !r.is_read }), contacts, 'Updated')}>{r.is_read ? 'Unread' : 'Read'}</button>
        <button className="btn btn-outline btn-sm" onClick={() => call(() => adm.patch(`/admin/contacts/${r.id}`, { show_as_review: !r.show_as_review }), contacts, 'Updated')}>{r.show_as_review ? 'Hide review' : 'Show as review'}</button>
        <button className="btn btn-ghost btn-sm danger" onClick={() => del(`/admin/contacts/${r.id}`, contacts)}>Delete</button>
      </RowActions>) },
  ];
  const newsletterCols = [
    { label: 'Subscribed', render: (r) => dateText(r.created_at) },
    { label: 'Email', key: 'email' },
    { label: '', className: 'right', render: (r) => <button className="btn btn-ghost btn-sm danger" onClick={() => del(`/admin/newsletters/${r.id}`, newsletters)}>Delete</button> },
  ];

  return (
    <>
      <PageHead title="Inbox" subtitle="Property requests, contact messages and newsletter subscribers." />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'inquiries' && <Panel list={inquiries} columns={inquiryCols} empty="No property requests." />}
      {tab === 'contacts' && <Panel list={contacts} columns={contactCols} empty="No messages." />}
      {tab === 'newsletters' && <Panel list={newsletters} columns={newsletterCols} empty="No subscribers yet." />}
    </>
  );
}
