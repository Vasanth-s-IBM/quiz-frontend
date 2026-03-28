import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api/services';
import { useToast } from '../context/ToastContext';
import AdminLayout from '../components/AdminLayout';
import { SkeletonProctoring } from '../components/Loader';
import { ShieldIcon } from '../components/Icons';

interface ProctoringConfig {
  enabled: boolean; check_interval_seconds: number;
  max_violations: number; allow_multiple_faces: boolean; allow_no_face: boolean;
}

const AdminProctoringConfig: React.FC = () => {
  const [config, setConfig] = useState<ProctoringConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    adminAPI.getProctoringConfig()
      .then(r => setConfig(r.data))
      .catch(() => showToast('Failed to load config', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const r = await adminAPI.updateProctoringConfig(config);
      setConfig(r.data); showToast('Settings saved', 'success');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const set = (key: keyof ProctoringConfig, value: any) =>
    setConfig(prev => prev ? { ...prev, [key]: value } : prev);

  if (loading || !config) return <AdminLayout title="Proctoring"><SkeletonProctoring /></AdminLayout>;

  const rows: { key: keyof ProctoringConfig; label: string; desc: string; type: 'toggle' | 'number'; unit?: string; min?: number; max?: number }[] = [
    { key: 'enabled',               label: 'Face Detection',       desc: 'Enable camera monitoring during exams',              type: 'toggle' },
    { key: 'check_interval_seconds',label: 'Check Interval',       desc: 'How often to capture and analyse a frame',           type: 'number', unit: 'sec',   min: 10, max: 300 },
    { key: 'max_violations',        label: 'Max Violations',       desc: 'Auto-submit exam after this many violations',        type: 'number', unit: 'times', min: 1,  max: 20  },
    { key: 'allow_no_face',         label: 'Allow No Face',        desc: "Don't flag when no face is detected",                type: 'toggle' },
    { key: 'allow_multiple_faces',  label: 'Allow Multiple Faces', desc: "Don't flag when more than one face is visible",      type: 'toggle' },
  ];

  return (
    <AdminLayout title="Proctoring">
      <div className="admin-page-header">
        <div>
          <h2>Proctoring Settings</h2>
          <p>Control how the face detection system behaves during exams</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: config.enabled ? '#10b981' : '#94a3b8' }} />
          <span style={{ fontSize: '.82rem', color: '#64748b', fontWeight: 600 }}>
            {config.enabled ? 'Proctoring Active' : 'Proctoring Disabled'}
          </span>
        </div>
      </div>

      {/* Two-column grid of config cards */}
      <div className="proctor-grid">
        {rows.map((row) => (
          <div key={row.key} className="proctor-card">
            <div className="proctor-card-left">
              <div className="proctor-card-label">{row.label}</div>
              <div className="proctor-card-desc">{row.desc}</div>
            </div>
            <div className="proctor-card-control">
              {row.type === 'toggle' ? (
                <label className="toggle">
                  <input type="checkbox" checked={config[row.key] as boolean}
                    onChange={e => set(row.key, e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              ) : (
                <div className="config-input-group">
                  <input type="number" min={row.min} max={row.max}
                    value={config[row.key] as number}
                    onChange={e => set(row.key, parseInt(e.target.value) || row.min)} />
                  <span>{row.unit}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary btn-lg" onClick={handleSave} disabled={saving}
          style={{ minWidth: 180 }}>
          {saving ? <><span className="btn-spinner" /> Saving…</> : <><ShieldIcon size={16} /> Save Settings</>}
        </button>
      </div>
    </AdminLayout>
  );
};

export default AdminProctoringConfig;
