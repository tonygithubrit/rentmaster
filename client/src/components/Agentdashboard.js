import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../utils/api';
import './Agentdashboard.css';

const AgentDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getDashboardStats('agent');
        setStats(res.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const commissionChangeLabel = stats?.commissionChange > 0
    ? `+${stats.commissionChange}% vs last month`
    : stats?.commissionChange < 0
      ? `${stats.commissionChange}% vs last month`
      : 'Same as last month';

  const commissionChangeClass = stats?.commissionChange > 0 ? 'positive' : stats?.commissionChange < 0 ? 'negative' : 'neutral';

  return (
    <div className="agent-dashboard">
      <div className="agent-header">
        <div>
          <h2 className="agent-title">Property Manager Command Center</h2>
          <p className="agent-subtitle">
            {loading ? 'Loading...' : `Managing ${stats?.totalListings || 0} listings • ${stats?.activeTenants || 0} Active tenants`}
          </p>
        </div>
        <div className="agent-actions">
          <button className="new-listing-btn" onClick={() => onNavigate && onNavigate('properties')}>
            New Listing
          </button>
        </div>
      </div>

      <div className="agent-stats-grid">
        <div className="agent-stat-card">
          <p className="agent-stat-label">This Month's Commissions</p>
          <div className="agent-stat-row">
            <h3 className="agent-stat-value">${(stats?.thisMonthCommissions || 0).toLocaleString()}</h3>
            <span className={`agent-stat-change ${commissionChangeClass}`}>{loading ? '—' : commissionChangeLabel}</span>
          </div>
        </div>
        <div className="agent-stat-card">
          <p className="agent-stat-label">Total Commissions Earned</p>
          <div className="agent-stat-row">
            <h3 className="agent-stat-value">${(stats?.totalCommissions || 0).toLocaleString()}</h3>
            <span className="agent-stat-change neutral">All time</span>
          </div>
        </div>
        <div className="agent-stat-card">
          <p className="agent-stat-label">Active Tenants</p>
          <div className="agent-stat-row">
            <h3 className="agent-stat-value">{stats?.activeTenants || 0}</h3>
            <span className="agent-stat-change neutral">Across {stats?.totalListings || 0} properties</span>
          </div>
        </div>
      </div>

      <div className="agent-main-grid">
        <div className="agent-chart-section">
          <div className="chart-header">
            <h3 className="chart-header-title">Monthly Commission Trend</h3>
          </div>
          <div className="agent-chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlyData || []}>
                <defs>
                  <linearGradient id="colorCommissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff'}} itemStyle={{color: '#fff'}} />
                <Area type="monotone" dataKey="commissions" stroke="#a855f7" strokeWidth={3} fill="url(#colorCommissions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="hot-leads-section">
          <h3 className="hot-leads-title">Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            <button className="new-listing-btn" style={{ width: '100%' }} onClick={() => onNavigate && onNavigate('properties')}>
              🏠 View My Properties
            </button>
            <button className="new-listing-btn" style={{ width: '100%', background: '#10b981' }} onClick={() => onNavigate && onNavigate('payments')}>
              💰 View Commissions
            </button>
            <button className="new-listing-btn" style={{ width: '100%', background: '#6366f1' }} onClick={() => onNavigate && onNavigate('tenants')}>
              👥 View My Tenants
            </button>
            <button className="new-listing-btn" style={{ width: '100%', background: '#f59e0b' }} onClick={() => onNavigate && onNavigate('maintenance')}>
              🔧 View Maintenance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;