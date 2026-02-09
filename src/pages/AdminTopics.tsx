import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { topicAPI } from "../api/services";
import { useToast } from "../context/ToastContext";
import Header from "../components/Header";
import Loader from "../components/Loader";

interface Topic {
  id: number;
  name: string;
}

const AdminTopics: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [name, setName] = useState("");
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const res = await topicAPI.getAll();
      setTopics(res.data);
    } catch {
      showToast("Failed to fetch topics", "error");
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTopic(null);
    setName("");
    setShowModal(true);
  };

  const openEditModal = (topic: Topic) => {
    setEditingTopic(topic);
    setName(topic.name);
    setShowModal(true);
  };

  const saveTopic = async () => {
    if (!name.trim()) {
      showToast("Topic name required", "error");
      return;
    }

    try {
      if (editingTopic) {
        await topicAPI.update(editingTopic.id, { name });
        showToast("Topic updated successfully", "success");
      } else {
        await topicAPI.create(name);
        showToast("Topic created successfully", "success");
      }
      setShowModal(false);
      fetchTopics();
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Failed to save topic", "error");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-page">
      <Header isAdmin />

      <div className="admin-container">
        <div className="admin-toolbar">
          <h1>Topic Management</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={() => navigate("/admin/dashboard")}>
              Back
            </button>
            <button className="btn-primary" onClick={openAddModal}>
              + Add Topic
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>Topic Name</th>
                <th style={{ width: "140px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn-ghost"
                        onClick={() => showToast("Edit feature - Future scope", "info")}
                      >
                        Edit
                      </button>
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
          <div className="modal-box">
            <h3>{editingTopic ? "Edit Topic" : "Add Topic"}</h3>

            <input
              placeholder="Topic name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={saveTopic}>
                {editingTopic ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTopics;
