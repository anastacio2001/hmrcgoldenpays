import React, { useState } from 'react';
import Toast from '../../components/Toast';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const Settings: React.FC = () => {
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const [companyInfo, setCompanyInfo] = useState({
    name: 'GOLDENPAYS LTD',
    companyNumber: '16227513',
    registeredOffice: 'Office 12 Initial Business Centre, Wilson Business Park, Manchester, UK, M40 8WN',
    email: 'enquiries@goldenpays.uk',
    phone: '+44 161 123 4567',
  });

  const [adminUsers] = useState([
    { id: 1, name: 'Admin User', email: 'admin@goldenpays.uk', role: 'Super Admin', lastLogin: '2026-02-04 14:32' },
  ]);

  const handleSaveCompanyInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({ show: true, message: 'Company information updated successfully!', type: 'success' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCompanyInfo({ ...companyInfo, [e.target.name]: e.target.value });
  };

  return (
    <div>
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-serif text-navy mb-2">Settings</h1>
        <p className="text-slate-500">Manage your system configuration and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Company Information */}
        <div className="bg-white rounded-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-bold text-navy text-lg">Company Information</h3>
            <p className="text-sm text-slate-500">Update your registered company details</p>
          </div>
          <form onSubmit={handleSaveCompanyInfo} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={companyInfo.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Company Number</label>
                <input
                  type="text"
                  name="companyNumber"
                  value={companyInfo.companyNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Registered Office</label>
                <textarea
                  name="registeredOffice"
                  value={companyInfo.registeredOffice}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Email</label>
                <input
                  type="email"
                  name="email"
                  value={companyInfo.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={companyInfo.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="bg-navy text-white px-6 py-3 text-sm font-bold tracking-wider hover:bg-slate-800 transition-all">
                SAVE CHANGES
              </button>
            </div>
          </form>
        </div>

        {/* Admin Users */}
        <div className="bg-white rounded-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-navy text-lg">Admin Users</h3>
              <p className="text-sm text-slate-500">Manage administrative access</p>
            </div>
            <button className="bg-navy text-white px-4 py-2 text-xs font-bold tracking-wider hover:bg-slate-800 transition-all">
              + ADD USER
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Last Login</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100">
                    <td className="px-6 py-4 font-semibold text-navy">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gold/20 text-gold rounded text-xs font-bold">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{user.lastLogin}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-navy hover:text-gold transition-colors mr-3" title="Edit">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-bold text-navy text-lg">Security Settings</h3>
            <p className="text-sm text-slate-500">Configure security and authentication</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded">
              <div>
                <p className="font-semibold text-navy text-sm">Two-Factor Authentication</p>
                <p className="text-xs text-slate-500">Add an extra layer of security</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded">
              <div>
                <p className="font-semibold text-navy text-sm">Session Timeout</p>
                <p className="text-xs text-slate-500">Auto-logout after 30 minutes of inactivity</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded">
              <div>
                <p className="font-semibold text-navy text-sm">Login Notifications</p>
                <p className="text-xs text-slate-500">Receive email alerts for new logins</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-navy"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-sm border border-red-200">
          <div className="p-6 border-b border-red-200">
            <h3 className="font-bold text-red-600 text-lg">Danger Zone</h3>
            <p className="text-sm text-slate-500">Irreversible and destructive actions</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded">
              <div>
                <p className="font-semibold text-red-700 text-sm">Clear All Data</p>
                <p className="text-xs text-slate-500">Permanently delete all inquiries, clients, and projects</p>
              </div>
              <button className="bg-red-600 text-white px-4 py-2 text-xs font-bold hover:bg-red-700 transition-all">
                CLEAR DATA
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded">
              <div>
                <p className="font-semibold text-red-700 text-sm">Export All Data</p>
                <p className="text-xs text-slate-500">Download a complete backup in JSON format</p>
              </div>
              <button className="border border-red-600 text-red-600 px-4 py-2 text-xs font-bold hover:bg-red-50 transition-all">
                EXPORT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
