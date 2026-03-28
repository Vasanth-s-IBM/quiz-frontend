import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../api/services';
import { useToast } from '../context/ToastContext';
import AdminLayout from '../components/AdminLayout';
import { SkeletonTable } from '../components/Loader';
import ConfirmModal from '../components/ConfirmModal';
import { UserIcon, XIcon } from '../components/Icons';

interface User { id: number; name: string; email: string; role_id: number; is_active: boolean; }

const AdminUsers: React.FC = () => {
  const [users, setUsers]           = useState<User[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL'|'ADMIN'|'USER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL'|'ACTIVE'|'INACTIVE'>('ALL');
  const [showModal, setShowModal]   = useState(false);
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [roleId, setRoleId]         = useState(2);
  const [confirmAction, setConfirmAction] = useState<{ userId: number } | null>(null);
  const { showToast } = useToast();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const r = await adminAPI.getUsers(); setUsers(r.data); }
    catch { showToast('Failed to fetch users', 'error'); }
    finally { setLoading(false); }
  };

  const filtered = useMemo(() => users.filter(u => {
    const s = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const r = roleFilter === 'ALL' || (roleFilter === 'ADMIN' && u.role_id === 1) || (roleFilter === 'USER' && u.role_id === 2);
    const st = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' && u.is_active) || (statusFilter === 'INACTIVE' && !u.is_active);
    return s && r && st;
  }), [users, search, roleFilter, statusFilter]);

  const saveUser = async () => {
    if (!name || !email || !password) { showToast('Fill all fields', 'error'); return; }
    try {
      await adminAPI.createUser({ name, email, password, role_id: roleId });
      showToast('User created', 'success'); setShowModal(false); fetchUsers();
    } catch (e: any) { showToast(e.response?.data?.detail || 'Failed', 'error'); }
  };

  const deactivateUser = async (id: number) => {
    try {
      await adminAPI.deactivateUser(id);
      showToast('User deactivated', 'success'); setConfirmAction(null); fetchUsers();
    } catch (e: any) { showToast(e.response?.data?.detail || 'Failed', 'error'); }
  };

  if (loading) return <AdminLayout title="Users"><SkeletonTable /></AdminLayout>;

  return (
    <AdminLayout title="Users">
      {confirmAction && (
        <ConfirmModal title="Deactivate User" message="Are you sure you want to deactivate this user?"
          onConfirm={() => deactivateUser(confirmAction.userId)} onCancel={() => setConfirmAction(null)} />
      )}

      <div className="admin-page-header">
        <div><h2>User Management</h2><p>{filtered.length} users found</p></div>
        <div className="admin-page-header-actions">
          <button className="btn-primary" onClick={() => { setName(''); setEmail(''); setPassword(''); setRoleId(2); setShowModal(true); }}>
            + Add User
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <input placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)}>
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5}><div className="table-empty"><div className="empty-icon"><UserIcon size={36} /></div><p>No users found</p></div></td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: '#64748b' }}>{u.email}</td>
                  <td><span className={`badge ${u.role_id === 1 ? 'badge-primary' : 'badge-neutral'}`}>{u.role_id === 1 ? 'Admin' : 'User'}</span></td>
                  <td><span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="row-actions">
                      {u.is_active && (
                        <button className="btn-ghost btn-danger btn-sm" onClick={() => setConfirmAction({ userId: u.id })}>
                          Deactivate
                        </button>
                      )}
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
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3>Add User</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><XIcon size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Name</label><input placeholder="Full name" value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div className="form-group"><label>Password</label><input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} /></div>
              <div className="form-group"><label>Role</label>
                <select value={roleId} onChange={e => setRoleId(Number(e.target.value))}>
                  <option value={1}>Admin</option><option value={2}>User</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={saveUser}>Create User</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
