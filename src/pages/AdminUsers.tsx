import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../api/services";
import { useToast } from "../context/ToastContext";
import Header from "../components/Header";
import Loader from "../components/Loader";
import ConfirmModal from "../components/ConfirmModal";

interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  is_active: boolean;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "USER">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(2);
  const [confirmAction, setConfirmAction] = useState<{ userId: number } | null>(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data);
    } catch {
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "ALL" ||
        (roleFilter === "ADMIN" && u.role_id === 1) ||
        (roleFilter === "USER" && u.role_id === 2);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && u.is_active) ||
        (statusFilter === "INACTIVE" && !u.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const openAddModal = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRoleId(2);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const saveUser = async () => {
    if (!name || !email || !password) {
      showToast("Please fill all required fields", "error");
      return;
    }

    try {
      await adminAPI.createUser({ name, email, password, role_id: roleId });
      showToast("User created successfully", "success");
      closeModal();
      fetchUsers();
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Failed to save user", "error");
    }
  };

  const deactivateUser = async (id: number) => {
    try {
      await adminAPI.deactivateUser(id);
      showToast("User deactivated successfully", "success");
      setConfirmAction(null);
      fetchUsers();
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Failed to deactivate user", "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-page">
      {confirmAction && (
        <ConfirmModal
          title="Deactivate User"
          message="Are you sure you want to deactivate this user?"
          onConfirm={() => deactivateUser(confirmAction.userId)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <Header isAdmin />

      <div className="admin-container">
        <div className="admin-toolbar">
          <h1>User Management</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => navigate("/admin/dashboard")}>
              Back
            </button>
            <button className="btn-primary" onClick={openAddModal}>
              + Add User
            </button>
          </div>
        </div>

        <div className="filters-bar">
          <input
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "ALL" | "ADMIN" | "USER")}
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">User</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ width: "160px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 20 }}>
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role_id === 1 ? "badge-success" : "badge-pending"}`}>
                        {u.role_id === 1 ? "Admin" : "User"}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? "badge-success" : "badge-pending"}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="btn-ghost" onClick={() => showToast("Edit feature - Future scope", "info")}>
                          Edit
                        </button>
                        {u.is_active && (
                          <button
                            className="btn-ghost btn-danger"
                            onClick={() => setConfirmAction({ userId: u.id })}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add User</h3>

            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <select
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
            >
              <option value={1}>Admin</option>
              <option value={2}>User</option>
            </select>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveUser}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
