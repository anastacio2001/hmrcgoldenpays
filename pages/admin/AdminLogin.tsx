import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../../components/Toast';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(email, password);

    if (success) {
      setToast({ show: true, message: 'Login successful! Redirecting...', type: 'success' });
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } else {
      setToast({ show: true, message: 'Invalid credentials. Please try again.', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      <div className="max-w-md w-full px-6">
        <div className="bg-white shadow-2xl overflow-hidden border border-slate-200">
          <div className="bg-navy p-8 text-center">
            <div className="w-16 h-16 bg-gold flex items-center justify-center rounded-sm mx-auto mb-4">
              <span className="text-white font-bold text-2xl">GP</span>
            </div>
            <h2 className="text-white font-serif text-2xl">Admin Portal</h2>
            <p className="text-slate-400 text-xs mt-2 uppercase tracking-[0.2em]">Secure Management Access</p>
          </div>
          
          <div className="p-8">
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-800 text-xs leading-relaxed">
              <strong>DEMO CREDENTIALS:</strong><br/>
              Email: admin@goldenpays.uk<br/>
              Password: GoldenPays2026!
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm transition-all"
                  placeholder="admin@goldenpays.uk"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-navy focus:outline-none text-sm transition-all"
                  placeholder="••••••••••••"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-navy text-white py-4 text-xs font-bold tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {loading ? 'AUTHENTICATING...' : 'ACCESS ADMIN PANEL'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <a href="/" className="text-xs text-gold hover:underline">← Back to Public Site</a>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">Encrypted Connection Active (AES-256)</span>
          </div>
        </div>
        
        <p className="mt-8 text-center text-xs text-slate-400">
          Unauthorized access attempts are logged and monitored.
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
