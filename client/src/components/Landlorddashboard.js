import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../utils/api';
import './Landlorddashboard.css';

const LandlordDashboard = ({ onQuickAction }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getDashboardStats('landlord');
        setStats(res.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (loading) {
    return (
      <div className="landlord-dashboard">
        <div className="landlord-header">
          <h2 className="landlord-title">Overview</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="landlord-dashboard">
      <div className="landlord-header">
        <h2 className="landlord-title">Overview</h2>
        <div className="last-updated">Last updated: Today, {timeStr}</div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Revenue" value={`$${(stats?.totalRevenue || 0).toLocaleString()}`} icon="💰" color="blue" />
        <StatCard title="Occupancy Rate" value={`${stats?.occupancyRate || 0}%`} icon="🏠" color="green" />
        <StatCard title="Active Leases" value={(stats?.activeLeases || 0).toString()} icon="📄" color="purple" />
        <StatCard title="Pending Maintenance" value={(stats?.pendingMaintenance || 0).toString()} icon="🛠️" color="red" />
      </div>

      <div className="chart-container">
        <h3 className="chart-title">Income Trend</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.monthlyData || []}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Area type="monotone" dataKey="income" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="activity-container">
          <h3 className="section-title">Recent Activity</h3>
          <div className="activity-list">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((item, i) => (
                <ActivityItem key={i} text={item.text} date={item.date} status={item.status} />
              ))
            ) : (
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>No recent activity yet</p>
            )}
          </div>
        </div>
        <div className="quick-actions-container">
          <h3 className="section-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            <QuickActionButton label="Add Property" icon="🏠" onClick={() => onQuickAction && onQuickAction('add-property')} />
            <QuickActionButton label="Add Tenant" icon="👥" onClick={() => onQuickAction && onQuickAction('add-tenant')} />
            <QuickActionButton label="Log Payment" icon="💵" onClick={() => onQuickAction && onQuickAction('log-payment')} />
            <QuickActionButton label="Maintenance" icon="🛠️" onClick={() => onQuickAction && onQuickAction('maintenance')} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const colorMap = { blue: 'stat-icon-blue', green: 'stat-icon-green', purple: 'stat-icon-purple', red: 'stat-icon-red' };
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorMap[color] || ''}`}>{icon}</div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
};

const ActivityItem = ({ text, date, status }) => {
  const dotMap = { success: 'activity-dot-success', warning: 'activity-dot-warning', danger: 'activity-dot-danger', info: 'activity-dot-info' };
  return (
    <div className="activity-item">
      <div className={`activity-dot ${dotMap[status]}`} />
      <div className="activity-content">
        <p className="activity-text">{text}</p>
        <p className="activity-date">{date}</p>
      </div>
    </div>
  );
};

const QuickActionButton = ({ label, icon, onClick }) => (
  <button className="quick-action-btn" onClick={onClick}>
    <span className="quick-action-icon">{icon}</span>
    <span className="quick-action-label">{label}</span>
  </button>
);

export default LandlordDashboard;