import { useState } from 'react';
import { adm } from '../adminApi.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import Pagination from '../../components/Pagination.jsx';
import { ErrorBox, Loader } from '../../components/Ui.jsx';
import { FormModal, RowActions, SearchBox, Table, Toolbar } from './AdminUi.jsx';

/**
 * Generic list + create/edit/delete screen for simple resources.
 * props: endpoint, columns, fields, empty (blank form), toForm(item), toBody(form,isEdit), search, extra(item) => nodes
 */
export default function CrudPage({ title, noun, endpoint, columns, fields, empty, toForm, toBody, search = true, query, extraActions, canCreate = true }) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | item
  const { data, meta, loading, error, reload } = useFetch(() => adm.get(endpoint, { page, per_page: 15, q, ...query }), [endpoint, page, q, JSON.stringify(query)]);

  const save = async (form) => {
    const isEdit = editing !== 'new';
    const body = toBody ? toBody(form, isEdit) : form;
    if (isEdit) {
      // multipart bodies cannot be sent with PUT in PHP, so spoof the method
      if (body instanceof FormData) {
        body.append('_method', 'PUT');
        await adm.post(`${endpoint}/${editing.id}`, body);
      } else {
        await adm.put(`${endpoint}/${editing.id}`, body);
      }
    } else {
      await adm.post(endpoint, body);
    }
    toast.success(`${noun} saved`);
    setEditing(null);
    reload();
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete this ${noun.toLowerCase()}?`)) return;
    try {
      await adm.del(`${endpoint}/${item.id}`);
      toast.success(`${noun} deleted`);
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const cols = [...columns, {
    label: '', className: 'right',
    render: (r) => (
      <RowActions>
        {extraActions?.(r, reload)}
        <button className="btn btn-outline btn-sm" onClick={() => setEditing(r)}>Edit</button>
        <button className="btn btn-ghost btn-sm danger" onClick={() => remove(r)}>Delete</button>
      </RowActions>
    ),
  }];

  return (
    <>
      <div className="a-head">
        <h1>{title}</h1>
        {canCreate && <button className="btn btn-primary" onClick={() => setEditing('new')}>+ Add {noun.toLowerCase()}</button>}
      </div>
      {search && <Toolbar><SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} /></Toolbar>}
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loader /> : <Table columns={cols} rows={data || []} />}
      <Pagination meta={meta} onPage={setPage} />
      {editing && (
        <FormModal
          title={editing === 'new' ? `Add ${noun.toLowerCase()}` : `Edit ${noun.toLowerCase()}`}
          fields={fields}
          initial={editing === 'new' ? empty : toForm(editing)}
          onSubmit={save}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
