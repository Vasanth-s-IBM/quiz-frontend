import React from 'react';

interface LoaderProps { text?: string; }

// Full-screen overlay loader — standalone pages only
const Loader: React.FC<LoaderProps> = ({ text = 'Loading…' }) => (
  <div className="loader-overlay" role="status" aria-label={text}>
    <div className="loader-ring" />
    <span className="loader-text">{text}</span>
  </div>
);
export default Loader;

// ── Skeleton primitives ──────────────────────────────────────
const Sk: React.FC<{ w?: string; h?: number; radius?: number; style?: React.CSSProperties }> = ({
  w = '100%', h = 14, radius = 6, style
}) => (
  <div className="skeleton" style={{ width: w, height: h, borderRadius: radius, ...style }} />
);

// ── Admin Dashboard skeleton ─────────────────────────────────
export const SkeletonDashboard: React.FC = () => (
  <div>
    {/* Stat cards row */}
    <div className="stats-grid" style={{ marginBottom: '2rem' }}>
      {[0,1,2,3].map(i => (
        <div key={i} className="stat-card">
          <div className="stat-card-top">
            <Sk w="52px" h={52} radius={14} />
          </div>
          <Sk w="60px" h={32} radius={8} style={{ marginBottom: 6 }} />
          <Sk w="80px" h={12} radius={4} />
        </div>
      ))}
    </div>
    {/* Table */}
    <Sk w="120px" h={12} radius={4} style={{ marginBottom: '1rem' }} />
    <div className="table-wrapper">
      <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1.5fr 1fr', gap: '1rem' }}>
          {[80,80,60,50,80,60].map((w,i) => <Sk key={i} w={`${w}px`} h={10} radius={4} />)}
        </div>
        <div className="sk-divider" />
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1.5fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <Sk w="70%" h={13} radius={4} />
            <Sk w="60%" h={13} radius={4} />
            <Sk w="55px" h={13} radius={4} />
            <Sk w="36px" h={22} radius={12} />
            <Sk w="72px" h={22} radius={12} />
            <Sk w="65px" h={13} radius={4} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Admin Table skeleton (Users, Topics, Results, Questions) ──
export const SkeletonTable: React.FC<{ cols?: number; rows?: number }> = ({ cols = 5, rows = 7 }) => (
  <div>
    {/* Page header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        <Sk w="160px" h={22} radius={6} />
        <Sk w="100px" h={12} radius={4} />
      </div>
      <Sk w="110px" h={36} radius={10} />
    </div>
    {/* Filter bar */}
    <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.25rem' }}>
      <Sk w="220px" h={38} radius={10} />
      <Sk w="140px" h={38} radius={10} />
    </div>
    {/* Table */}
    <div className="table-wrapper">
      <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {Array.from({ length: cols }).map((_, i) => <Sk key={i} w="80px" h={10} radius={4} />)}
        </div>
        <div className="sk-divider" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Sk w="30%" h={13} radius={4} />
            <Sk w="25%" h={13} radius={4} />
            <Sk w="50px" h={22} radius={12} />
            <Sk w="50px" h={22} radius={12} />
            <Sk w="80px" h={28} radius={8} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Proctoring config skeleton ────────────────────────────────
export const SkeletonProctoring: React.FC = () => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        <Sk w="180px" h={22} radius={6} />
        <Sk w="260px" h={12} radius={4} />
      </div>
      <Sk w="140px" h={20} radius={10} />
    </div>
    <div style={{ maxWidth: 680 }}>
      <div className="proctor-config-card">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="config-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              <Sk w="140px" h={14} radius={4} />
              <Sk w="220px" h={11} radius={4} />
            </div>
            <Sk w={i === 1 || i === 2 ? '90px' : '44px'} h={i === 1 || i === 2 ? 38 : 24} radius={i === 1 || i === 2 ? 10 : 12} />
          </div>
        ))}
      </div>
      <Sk w="100%" h={48} radius={10} style={{ marginTop: '1.5rem' }} />
    </div>
  </div>
);

// ── User-facing grid skeleton ─────────────────────────────────
export const SkeletonCard: React.FC = () => (
  <div className="skeleton-card-inner">
    <Sk w="60%" h={22} radius={6} />
    <Sk w="90%" h={14} />
    <Sk w="75%" h={14} />
    <Sk w="100%" h={36} style={{ marginTop: 8 }} />
  </div>
);

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
  </div>
);

// Inline spinner (kept for non-admin fallback)
export const InlineLoader: React.FC<{ text?: string }> = ({ text = 'Loading…' }) => (
  <div className="inline-loader" role="status">
    <div className="inline-loader-ring" />
    <span className="inline-loader-text">{text}</span>
  </div>
);
