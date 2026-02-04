import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Inquiry {
  id: string;
  company: string;
  name: string;
  email: string;
  service: string;
  message: string;
  createdAt: string;
  status: 'new' | 'in-progress' | 'resolved';
}

const Inquiries: React.FC = () => {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch inquiries from API
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/inquiries`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch inquiries');
        }

        const data = await response.json();
        setInquiries(data.data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load inquiries');
        console.error('Error fetching inquiries:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInquiries();
      // Refresh every 30 seconds
      const interval = setInterval(fetchInquiries, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

  const filteredInquiries = filterStatus === 'all' 
    ? inquiries 
    : inquiries.filter(i => i.status === filterStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy mb-4"></div>
          <p className="text-slate-500">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-navy mb-2">Inquiries Management</h1>
          <p className="text-slate-500">Review and manage contact form submissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 text-sm focus:outline-none focus:border-navy"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-sm border border-slate-200 p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-slate-500 text-lg mb-2">No inquiries found</p>
          <p className="text-slate-400 text-sm">
            {filterStatus !== 'all' 
              ? `No inquiries with status "${filterStatus}"` 
              : 'New inquiries will appear here when submitted through the contact form'}
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inquiries List */}
        <div className="lg:col-span-1 bg-white rounded-sm border border-slate-200 overflow-hidden max-h-[calc(100vh-16rem)] overflow-y-auto">
          {filteredInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              onClick={() => setSelectedInquiry(inquiry)}
              className={`p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50 ${
                selectedInquiry?.id === inquiry.id ? 'bg-blue-50 border-l-4 border-l-navy' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-navy">{inquiry.company}</p>
                  <p className="text-xs text-slate-500">{inquiry.name}</p>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getStatusColor(inquiry.status)}`}>
                  {inquiry.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-1">{inquiry.service}</p>
              <p className="text-[10px] text-slate-400">{formatDate(inquiry.createdAt)}</p>
            </div>
          ))}
        </div>

        {/* Inquiry Detail */}
        <div className="lg:col-span-2 bg-white rounded-sm border border-slate-200">
          {selectedInquiry ? (
            <div>
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-serif text-navy mb-1">{selectedInquiry.company}</h2>
                    <p className="text-slate-500">{selectedInquiry.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getStatusColor(selectedInquiry.status)}`}>
                    {selectedInquiry.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Email</p>
                    <p className="text-navy">{selectedInquiry.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Date</p>
                    <p className="text-navy">{formatDate(selectedInquiry.createdAt)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Service Requested</p>
                    <p className="text-navy">{selectedInquiry.service}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Message</p>
                <p className="text-slate-700 leading-relaxed">{selectedInquiry.message}</p>
              </div>

              <div className="p-6 bg-slate-50">
                <p className="text-xs font-bold text-slate-500 uppercase mb-4">Actions</p>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-navy text-white px-4 py-3 text-xs font-bold tracking-wider hover:bg-slate-800 transition-all">
                    SEND EMAIL
                  </button>
                  <button className="bg-green-600 text-white px-4 py-3 text-xs font-bold tracking-wider hover:bg-green-700 transition-all">
                    CONVERT TO CLIENT
                  </button>
                  <button className="border border-slate-300 text-slate-600 px-4 py-3 text-xs font-bold tracking-wider hover:bg-slate-100 transition-all">
                    MARK AS PENDING
                  </button>
                  <button className="border border-red-300 text-red-600 px-4 py-3 text-xs font-bold tracking-wider hover:bg-red-50 transition-all">
                    REJECT INQUIRY
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Select an inquiry to view details</p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default Inquiries;
