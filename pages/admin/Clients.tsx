import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../../components/Toast';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'prospect';
  since: string;
  revenue: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const Clients: React.FC = () => {
  const { token } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
  });

  // Fetch clients from API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/clients`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }

        const data = await response.json();
        setClients(data.data || []);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setToast({ show: true, message: 'Failed to load clients', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchClients();
    }
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'prospect': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({ show: true, message: 'Client added successfully!', type: 'success' });
    setShowModal(false);
    setFormData({ name: '', company: '', email: '', phone: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy mb-4"></div>
          <p className="text-slate-500">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-navy mb-2">Clients Management</h1>
          <p className="text-slate-500">Manage your client database and relationships</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-navy text-white px-6 py-3 text-sm font-bold tracking-wider hover:bg-slate-800 transition-all"
        >
          + ADD NEW CLIENT
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Clients</p>
          <p className="text-3xl font-bold text-navy">{clients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Active Clients</p>
          <p className="text-3xl font-bold text-green-600">{clients.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="bg-white p-6 rounded-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-navy">£105,500</p>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Client</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Since</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Revenue</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-navy">{client.name}</p>
                      <p className="text-sm text-slate-500">{client.company}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-slate-700">{client.email}</p>
                      <p className="text-slate-500">{client.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">{client.since}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-navy">{client.revenue}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-navy hover:text-gold transition-colors mr-3" title="Edit">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white w-full max-w-2xl mx-4 rounded-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xl font-serif text-navy">Add New Client</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-navy">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-600 text-sm font-bold hover:bg-slate-50"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-navy text-white text-sm font-bold hover:bg-slate-800"
                >
                  ADD CLIENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
