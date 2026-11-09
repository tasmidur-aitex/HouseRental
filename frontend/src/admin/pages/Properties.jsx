import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adm } from '../adminApi.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import Pagination from '../../components/Pagination.jsx';
import { ErrorBox, Field, Loader, Modal } from '../../components/Ui.jsx';
import { money, PLACEHOLDER, STATUS, dateText } from '../../utils/format.js';
import { RowActions, SearchBox, Table, Tabs, Toolbar } from '../components/AdminUi.jsx';

const TABS = [['', 'All'], ['0', 'Pending'], ['1', 'Published'], ['2', 'In progress'], ['3', 'Delivered'], ['4', 'Cancelled']];

// action => [label, button style]. Which ones to offer depends on the current status.
const ACTIONS = {
  approve: ['Approve & publish', 'btn-primary'],
  cancel: ['Cancel listing', 'btn-outline danger'],
  pending: ['Move back to pending', 'btn-outline'],
  'delivery-progress': ['Mark in progress', 'btn-outline'],
  delivered: ['Mark delivered', 'btn-primary'],
};
const NEXT = { 0: ['approve', 'cancel'], 1: ['delivery-progress', 'delivered', 'pending', 'cancel'], 2: ['delivered', 'pending', 'cancel'], 3: ['pending'], 4: ['pending'] };

function EditModal({ property, onClose, onSaved }) {
  const toast = useToast();
  const [f, setF] = useState({
    price: property.price ?? '', discount_price: property.discount_price ?? '', total_price: property.total_price ?? '', service_charge: property.service_charge ?? '',
    map_link: property.map_link || '', latitude: property.latitude ?? '', longitude: property.longitude ?? '', details: property.details || '',
    trend: property.badges.trend, best_rated: property.badges.best_rated, hot_new: property.badges.hot_new,
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const body = new FormData();
    body.append('_method', 'PUT');
    Object.entries(f).forEach(([k, v]) => {
      if (typeof v === 'boolean') body.append(k, v ? 1 : 0);
      else if (v !== '') body.append(k, v);
    });
    try {
      await adm.post(`/admin/properties/${property.id}`, body);
      toast.success('Property updated');
      onSaved();
    } catch (error) {
      setErr(error);
      setBusy(false);
    }
  };

  return (
    <Modal title={`Edit ${property.code}`} onClose={onClose}>
      <form onSubmit={submit} className="a-form">
        {err && !err.errors && <div className="alert alert-error">{err.message}</div>}
        <div className="row-2">
          <Field label="Price (৳)" error={err?.field('price')}><input type="number" min="0" value={f.price} onChange={set('price')} /></Field>
          <Field label="Discount price (৳)" error={err?.field('discount_price')}><input type="number" min="0" value={f.discount_price} onChange={set('discount_price')} /></Field>
        </div>
        <div className="row-2">
          <Field label="Total price (৳)" error={err?.field('total_price')} hint="Used in delivered-value reports"><input type="number" min="0" value={f.total_price} onChange={set('total_price')} /></Field>
          <Field label="Service charge (৳)" error={err?.field('service_charge')} hint="Listing fee. Empty = default fee"><input type="number" min="0" value={f.service_charge} onChange={set('service_charge')} /></Field>
        </div>
        <Field label="Google Maps link" error={err?.field('map_link')}><input value={f.map_link} onChange={set('map_link')} /></Field>
        <div className="row-2">
          <Field label="Latitude" error={err?.field('latitude')}><input type="number" step="any" value={f.latitude} onChange={set('latitude')} /></Field>
          <Field label="Longitude" error={err?.field('longitude')}><input type="number" step="any" value={f.longitude} onChange={set('longitude')} /></Field>
        </div>
        <Field label="Details" error={err?.field('details')}><textarea rows="4" value={f.details} onChange={set('details')} /></Field>
        <div className="check-group">
          {[['hot_new', 'Hot / new'], ['trend', 'Trending'], ['best_rated', 'Best rated']].map(([k, label]) => (
            <label key={k} className="check-row"><input type="checkbox" checked={!!f[k]} onChange={(e) => setF({ ...f, [k]: e.target.checked })} /><span>{label}</span></label>
          ))}
        </div>
        <div className="a-form-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
        </div>
      </form>
    </Modal>
  );
}

function DetailModal({ id, onClose, onChanged }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const { data: p, loading, error, reload } = useFetch(() => adm.get(`/admin/properties/${id}`), [id]);
  const [busy, setBusy] = useState('');

  const act = async (action) => {
    if (action === 'cancel' && !window.confirm('Cancel this listing?')) return;
    setBusy(action);
    try {
      await adm.post(`/admin/properties/${id}/${action}`);
      toast.success('Status updated');
      reload();
      onChanged();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy('');
    }
  };

  if (editing && p) return <EditModal property={p} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); reload(); onChanged(); }} />;

  return (
    <Modal title={p ? `${p.title} · ${p.code}` : 'Property'} onClose={onClose}>
      {loading && !p ? <Loader /> : error ? <ErrorBox error={error} /> : (
        <div className="a-detail">
          <div className="a-detail-imgs">
            {(p.images.length ? p.images : [PLACEHOLDER]).map((src) => <img key={src} src={src} alt="" onError={(e) => (e.currentTarget.src = PLACEHOLDER)} />)}
          </div>
          <p><span className={`badge badge-${STATUS[p.status].tone}`}>{STATUS[p.status].label}</span> <strong>{money(p.price)}</strong> {p.discount_price ? <small className="muted">(discount {money(p.discount_price)})</small> : null}</p>
          <dl className="a-dl">
            <dt>Purpose</dt><dd>{p.purpose} · {p.category} · {p.type}</dd>
            <dt>Rooms</dt><dd>{p.bedroom} bed · {p.bathroom} bath · {p.kitchen} kitchen · parking {p.parking ?? 0}</dd>
            <dt>Area / floor</dt><dd>{p.area} · {p.floor || '—'}</dd>
            <dt>Address</dt><dd>{p.address}, {p.subcity?.name}, {p.city?.name}</dd>
            <dt>Submitted by</dt><dd>{p.contact ? `${p.contact.name} · ${p.contact.phone} · ${p.contact.email}` : '—'} <small className="muted">{dateText(p.created_at)}</small></dd>
            <dt>Badges</dt><dd>{['hot_new', 'trend', 'best_rated'].filter((k) => p.badges[k]).join(', ') || 'none'}</dd>
            <dt>Map</dt><dd>{p.map_link ? <a href={p.map_link} target="_blank" rel="noreferrer">Open map</a> : '—'}{p.latitude ? ` · ${p.latitude}, ${p.longitude}` : ''}</dd>
          </dl>
          <p className="prose">{p.details}</p>
          <div className="a-actions">
            <button className="btn btn-outline" onClick={() => setEditing(true)}>Edit details & badges</button>
            {NEXT[p.status].map((a) => (
              <button key={a} className={`btn ${ACTIONS[a][1]}`} disabled={!!busy} onClick={() => act(a)}>{busy === a ? '…' : ACTIONS[a][0]}</button>
            ))}
          </div>
          <p className="muted small">Tip: set a price, area and badges first, then approve. Only published and in-progress listings are visible on the site.</p>
        </div>
      )}
    </Modal>
  );
}

export default function Properties() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const [page, setPage] = useState(1);
  const [q, setQ] = useState(params.get('q') || '');
  const [openId, setOpenId] = useState(null);
  // the top-bar search navigates here with ?q=, so follow the URL
  useEffect(() => { setQ(params.get('q') || ''); setPage(1); }, [params]);
  const { data, meta, loading, error, reload } = useFetch(() => adm.get('/admin/properties', { page, per_page: 15, q, status }), [page, q, status]);

  const setStatus = (v) => { setParams(v === '' ? {} : { status: v }); setPage(1); };
  const remove = async (p) => {
    if (!window.confirm(`Permanently delete “${p.title}”?`)) return;
    try {
      await adm.del(`/admin/properties/${p.id}`);
      toast.success('Property deleted');
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const columns = [
    { label: 'Property', render: (p) => (
      <div className="cell-prop">
        <img src={p.thumbnail || PLACEHOLDER} alt="" onError={(e) => (e.currentTarget.src = PLACEHOLDER)} />
        <div><strong>{p.title}</strong><small>{p.code} · {p.city?.name}</small></div>
      </div>) },
    { label: 'Price', render: (p) => money(p.price) },
    { label: 'Submitted', render: (p) => dateText(p.created_at) },
    { label: 'Status', render: (p) => <span className={`badge badge-${STATUS[p.status].tone}`}>{STATUS[p.status].label}</span> },
    { label: '', className: 'right', render: (p) => (
      <RowActions>
        <button className="btn btn-primary btn-sm" onClick={() => setOpenId(p.id)}>{p.status === 0 ? 'Review' : 'Manage'}</button>
        <button className="btn btn-ghost btn-sm danger" onClick={() => remove(p)}>Delete</button>
      </RowActions>) },
  ];

  return (
    <>
      <div className="a-head"><h1>Properties</h1></div>
      <Tabs tabs={TABS} value={status} onChange={setStatus} />
      <Toolbar><SearchBox key={params.get('q') || 'x'} value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search title, address, code…" /></Toolbar>
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loader /> : <Table columns={columns} rows={data || []} empty="No properties in this view." />}
      <Pagination meta={meta} onPage={setPage} />
      {openId && <DetailModal id={openId} onClose={() => setOpenId(null)} onChanged={reload} />}
    </>
  );
}
