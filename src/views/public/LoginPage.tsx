import React, { useState } from 'react';
import {
  Library,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Users,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface LoginPageProps {
  onGoRegister: () => void;
  onGoHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onGoRegister, onGoHome }) => {
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2.5 mx-auto hover:opacity-85 transition-opacity"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Library className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-slate-900 tracking-tight text-xl block leading-tight">UniLibrary</span>
            <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Management System</span>
          </div>
        </button>
        <h2 className="mt-6 text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Access your library circulation dashboard and book catalog
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl sm:px-10 border border-slate-200/80 space-y-6">
          {/* Quick Demo Credentials Buttons */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-blue-900 font-bold">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Quick 1-Click Demo Login
              </span>
              <span className="text-[10px] text-blue-500 uppercase">Pre-filled</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickDemoLogin('admin')}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>Admin Demo</span>
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('user')}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-white" />
                <span>Student Demo</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@university.edu or student email"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-60"
            >
              {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onGoRegister}
                className="font-bold text-blue-600 hover:text-blue-800"
              >
                Register for Library Card
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
