import React, { useEffect, useState } from 'react';
import { topicAPI } from '../api/services';
import { useToast } from '../context/ToastContext';
import AdminLayout from '../components/AdminLayout';
import { SkeletonTable } from '../components/Loader';
import { BookIcon, XIcon } from '../components/Icons';

interface Topic { id: number; name: string; question_count?: number; }

const AdminTopics: React.FC = () => {
  const [topics, setTopics]         = useState<Topic[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [name, setName]             = useState('');
  const { showToast } = useToast();

  useEffect(() => { fetchTopics(); }, []);

  const fetchTopics = async () => {
    try { const r = await topicAPI.getAll(); setTopics(r.data); }
    catch { showToast('Failed to fetch topics', 'error'); }
    finally { setLoading(false); }
  };

  const saveTopic = async () => {
    if (!name.trim()) { showToast('Topic name required', 'error'); return; }
    try {
      if (editingTopic) { await topicAPI.update(editingTopic.id, { name }); showToast('Topic updated', 'success'); }
      else { await topicAPI.create(name); showToast('Topic created', 'success'); }
      setShowModal(false); fetchTopics();
    } catch (e: any) { showToast(e.response?.data?.detail || 'Failed', 'error'); }
  };

  if (loading) return <AdminLayout title="Topics"><SkeletonTable cols={3} rows={6} /></AdminLayout>;

  return (
    <AdminLayout title="Topics">
      <div className="admin-page-header">
        <div><h2>Topic Management</h2><p>{topics.length} topics available</p></div>
        <button className="btn-primary" onClick={() => { setEditingTopic(null); setName(''); setShowModal(true); }}>
          + Add Topic
        </button>
      </div>

      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr><th>Topic Name</th><th>Questions</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {topics.length === 0 ? (
                <tr><td colSpan={3}><div className="table-empty"><div className="empty-icon"><BookIcon size={36} /></div><p>No topics yet</p></div></td></tr>
              ) : topics.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td><span className="badge badge-neutral">{t.question_count ?? 0} questions</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-ghost btn-sm" onClick={() => { setEditingTopic(t); setName(t.name); setShowModal(true); }}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>{editingTopic ? 'Edit Topic' : 'Add Topic'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><XIcon size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Topic Name</label><input placeholder="e.g. Operating Systems" value={name} onChange={e => setName(e.target.value)} /></div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveTopic}>{editingTopic ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminTopics;
