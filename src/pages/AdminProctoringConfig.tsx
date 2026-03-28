import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/services';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import Loader from '../components/Loader';

interface ProctoringConfig {
  enabled: boolean;
  check_interval_seconds: number;
  max_violations: number;
  allow_multiple_faces: boolean;
  allow_no_face: boolean;
}

const AdminProctoringConfig: React.FC = () => {
  const [config, setConfig] = useState<ProctoringConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      const res = await adminAPI.getProctoringConfig();
      setConfig(res.data);
    } catch {
      showToast('Failed to load proctoring config', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await adminAPI.updateProctoringConfig(config);
      setConfig(res.data);
      showToast('Proctoring settings saved', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof ProctoringConfig, value: any) =>
    setConfig(prev => prev ? { ...prev, [key]: value } : prev);

  if (loading || !config) return <Loader />;

  return (
    <div className="admin-page">
      <Header isAdmin />
      <div className="admin-container" style={{ maxWidth: 640 }}>
        <div className="admin-toolbar">
          <h1>🎥 Proctoring Settings</h1>
          <button onClick={() => navigate('/admin/dashboard')} className="btn-secondary">Back</button>
        </div>

        <div className="proctor-config-card">

          {/* Enable / Disable */}
          <div className="config-row">
            <div className="config-label">
              <span>Face Detection</span>
              <small>Enable or disable camera monitoring during exams</small>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={config.enabled}
                onChange={e => set('enabled', e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

          <hr />

          {/* Check interval */}
          <div className="config-row">
            <div className="config-label">
              <span>Check Interval</span>
              <small>How often to capture and analyse a frame (seconds)</small>
            </div>
            <div className="config-input-group">
              <input
                type="number" min={10} max={300}
                value={config.check_interval_seconds}
                onChange={e => set('check_interval_seconds', parseInt(e.target.value) || 30)}
                style={{ width: 80 }}
              />
              <span>sec</span>
            </div>
          </div>

          {/* Max violations */}
          <div className="config-row">
            <div className="config-label">
              <span>Max Violations</span>
              <small>Auto-submit exam after this many violations</small>
            </div>
            <div className="config-input-group">
              <input
                type="number" min={1} max={20}
                value={config.max_violations}
                onChange={e => set('max_violations', parseInt(e.target.value) || 5)}
                style={{ width: 80 }}
              />
              <span>times</span>
            </div>
          </div>

          <hr />

          {/* Allow no face */}
          <div className="config-row">
            <div className="config-label">
              <span>Allow No Face</span>
              <small>Don't flag when no face is detected (e.g. looking down)</small>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={config.allow_no_face}
                onChange={e => set('allow_no_face', e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

          {/* Allow multiple faces */}
          <div className="config-row">
            <div className="config-label">
              <span>Allow Multiple Faces</span>
              <small>Don't flag when more than one face is visible</small>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={config.allow_multiple_faces}
                onChange={e => set('allow_multiple_faces', e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>

          <div style={{ marginTop: 28 }}>
            <button className="btn-primary" onClick={handleSave} disabled={saving}
              style={{ width: '100%', padding: '12px' }}>
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProctoringConfig;
