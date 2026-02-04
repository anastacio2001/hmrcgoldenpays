import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalInquiries: 0,
    activeClients: 0,
    activeProjects: 0,
    revenue: '£0'
  });
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch inquiries
        const inquiriesRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/inquiries`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const inquiriesData = await inquiriesRes.json();
        
        // Fetch clients
        const clientsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/clients`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const clientsData = await clientsRes.json();
        
        // Fetch projects
        const projectsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/projects`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectsData = await projectsRes.json();

        // Calculate stats
        const inquiries = inquiriesData.data || [];
        const clients = clientsData.data || [];
        const projects = projectsData.data || [];
        
        const activeClients = clients.filter((c: any) => c.status === 'active').length;
        const activeProjects = projects.filter((p: any) => p.status === 'active').length;
        
        // Calculate total revenue from clients
        const totalRevenue = clients.reduce((sum: number, client: any) => {
          const rev = parseFloat(client.revenue.replace(/[£,]/g, '') || '0');
          return sum + rev;
        }, 0);

        setStats({
          totalInquiries: inquiries.length,
          activeClients,
          activeProjects,
          revenue: `£${totalRevenue.toLocaleString()}`
        });

        // Set recent inquiries (last 3)
        setRecentInquiries(inquiries.slice(0, 3));
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy mb-4"></div>
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statsArray = [
    { title: 'Total Inquiries', value: stats.totalInquiries.toString(), change: '+12%', icon: '📧', color: 'blue' },
    { title: 'Active Clients', value: stats.activeClients.toString(), change: '+5%', icon: '👥', color: 'green' },
    { title: 'Active Projects', value: stats.activeProjects.toString(), change: '+3', icon: '📁', color: 'purple' },
    { title: 'Revenue (YTD)', value: stats.revenue, change: '+28%', icon: '💰', color: 'gold' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-navy mb-2">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsArray.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-sm border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-navy">{stat.value}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-green-600">{stat.change}</span>
              <span className="text-xs text-slate-400">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-navy">Recent Inquiries</h3>
            <Link to="/admin/inquiries" className="text-xs text-gold hover:underline">View All →</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentInquiries.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm">No recent inquiries</p>
              </div>
            ) : (
              recentInquiries.map((inquiry) => (
                <div key={inquiry.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm text-navy">{inquiry.company}</p>
                      <p className="text-xs text-slate-500">{inquiry.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">{inquiry.service}</p>
                  <p className="text-[10px] text-slate-400">{new Date(inquiry.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-bold text-navy">Quick Actions</h3>
          </div>
          <div className="p-6 space-y-3">
            <Link to="/admin/clients" className="block w-full bg-navy text-white px-4 py-3 text-sm font-bold tracking-wider hover:bg-slate-800 transition-all text-center">
              + ADD NEW CLIENT
            </Link>
            <Link to="/admin/projects" className="block w-full border border-navy text-navy px-4 py-3 text-sm font-bold tracking-wider hover:bg-navy hover:text-white transition-all text-center">
              + CREATE PROJECT
            </Link>
            <Link to="/admin/inquiries" className="block w-full border border-slate-300 text-slate-600 px-4 py-3 text-sm font-bold tracking-wider hover:bg-slate-50 transition-all text-center">
              VIEW INQUIRIES
            </Link>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">System Status</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Email Service</span>
                <span className="flex items-center text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Database</span>
                <span className="flex items-center text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Backup Status</span>
                <span className="flex items-center text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Up to date
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
