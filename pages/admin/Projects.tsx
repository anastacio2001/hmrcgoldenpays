import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../../components/Toast';

interface Project {
  id: string;
  name: string;
  client: string;
  type: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  progress: number;
  startDate: string;
  endDate: string;
  value: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const Projects: React.FC = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        setProjects(data.data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setToast({ show: true, message: 'Failed to load projects', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProjects();
    }
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const handleCreateProject = () => {
    setToast({ show: true, message: 'Project created successfully!', type: 'success' });
    setShowModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-navy mb-4"></div>
          <p className="text-slate-500">Loading projects...</p>
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
          <h1 className="text-3xl font-serif text-navy mb-2">Projects Management</h1>
          <p className="text-slate-500">Track and manage client projects</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-navy text-white px-6 py-3 text-sm font-bold tracking-wider hover:bg-slate-800 transition-all"
        >
          + CREATE PROJECT
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Projects</p>
          <p className="text-3xl font-bold text-navy">{projects.length}</p>
        </div>
        <div className="bg-white p-6 rounded-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Active</p>
          <p className="text-3xl font-bold text-green-600">{projects.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="bg-white p-6 rounded-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Completed</p>
          <p className="text-3xl font-bold text-purple-600">{projects.filter(p => p.status === 'completed').length}</p>
        </div>
        <div className="bg-white p-6 rounded-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Value</p>
          <p className="text-3xl font-bold text-navy">£190K</p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-sm border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-serif text-lg text-navy mb-1">{project.name}</h3>
                  <p className="text-sm text-slate-500">{project.client}</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-xs text-slate-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {project.type}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {project.startDate}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">Progress</span>
                <span className="font-bold text-navy">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-navy h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">End Date</p>
                  <p className="font-semibold text-navy">{project.endDate}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Project Value</p>
                  <p className="font-semibold text-navy">{project.value}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button className="text-xs text-navy hover:text-gold font-bold transition-colors">
                VIEW DETAILS →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white w-full max-w-2xl mx-4 rounded-sm max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-serif text-navy">Create New Project</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-navy">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateProject(); }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Project Name</label>
                  <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Client</label>
                    <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm">
                      <option value="">Select Client</option>
                      <option>TechCorp Ltd</option>
                      <option>DataFlow Inc</option>
                      <option>FinanceHub</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Project Type</label>
                    <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm">
                      <option value="">Select Type</option>
                      <option>Infrastructure</option>
                      <option>Security</option>
                      <option>Compliance</option>
                      <option>Consulting</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Start Date</label>
                    <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">End Date</label>
                    <input type="date" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Project Value (£)</label>
                  <input type="number" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Description</label>
                  <textarea rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm"></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 border border-slate-300 text-slate-600 text-sm font-bold hover:bg-slate-50">
                  CANCEL
                </button>
                <button type="submit" className="px-6 py-3 bg-navy text-white text-sm font-bold hover:bg-slate-800">
                  CREATE PROJECT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
