import { useState } from 'react';
import { adm } from '../adminApi.js';
import { downloadFile } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { ErrorBox, Loader } from '../../components/Ui.jsx';
import { RowActions, Table } from '../components/AdminUi.jsx';

const size = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export default function Backups() {
  const toast = useToast();
  const [running, setRunning] = useState(false);
  const { data, loading, error, reload } = useFetch(() => adm.get('/admin/backups'), []);

  const run = async () => {
    setRunning(true);
    try {
      await adm.post('/admin/backups');
      toast.success('Backup created');
      reload();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setRunning(false);
    }
  };
  const remove = async (b) => {
    if (!window.confirm(`Delete ${b.name}?`)) return;
    try {
      await adm.del(`/admin/backups/${encodeURIComponent(b.name)}`);
      toast.success('Deleted');
      reload();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const columns = [
    { label: 'File', render: (b) => <code>{b.name}</code> },
    { label: 'Size', render: (b) => size(b.size) },
    { label: 'Created', render: (b) => new Date(b.created_at).toLocaleString() },
    { label: '', className: 'right', render: (b) => (
      <RowActions>
        <button className="btn btn-outline btn-sm" onClick={() => downloadFile(`/admin/backups/${encodeURIComponent(b.name)}`, {}, b.name).catch((e) => toast.error(e.message))}>Download</button>
        <button className="btn btn-ghost btn-sm danger" onClick={() => remove(b)}>Delete</button>
      </RowActions>) },
  ];

  return (
    <>
      <div className="a-head"><h1>Database backups</h1><button className="btn btn-primary" onClick={run} disabled={running}>{running ? 'Backing up…' : 'Back up now'}</button></div>
      <ErrorBox error={error} onRetry={reload} />
      {loading && !data ? <Loader /> : <Table columns={columns} rows={(data || []).map((b) => ({ ...b, id: b.name }))} empty="No backups yet." />}
    </>
  );
}
