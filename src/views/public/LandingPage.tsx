import React, { useEffect, useState } from 'react';
import {
  Library,
  BookOpen,
  CheckCircle2,
  Clock,
  Shield,
  Search,
  ArrowRight,
  Sparkles,
  Users,
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import { Book } from '../../types/index.ts';

interface LandingPageProps {
  onGoLogin: () => void;
  onGoRegister: () => void;
  onSelectBook?: (bookId: number) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoLogin, onGoRegister }) => {
  const { quickDemoLogin } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ totalBooks: 22, availableBooks: 70, members: 5 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.getBooks({ limit: 8 });
        setFeaturedBooks(res.books || []);
        if (res.books) {
          const totalCopies = res.books.reduce((acc: number, b: Book) => acc + b.total_copies, 0);
          const availCopies = res.books.reduce((acc: number, b: Book) => acc + b.available_copies, 0);
          setStats({ totalBooks: res.pagination?.total || 22, availableBooks: availCopies, members: 6 });
        }
      } catch (err) {
        // use defaults
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-6 sm:px-12 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg block leading-none">UniLibrary</span>
            <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">Management System</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGoLogin}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={onGoRegister}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            Register Student
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-6 sm:px-12 lg:px-20 bg-radial from-blue-50/50 via-slate-50 to-slate-50">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Comprehensive University Library Software • B.Tech CSE Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Automating Modern Academic <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Library Operations & Circulation
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A production-ready library management system featuring real-time catalog search, instant shelf availability tracking, automated issue & return approvals, and transparent overdue fine assessments.
          </p>

          {/* Quick 1-Click Demo Evaluation Login Buttons */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-lg shadow-blue-500/5 max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Quick 1-Click Demo Login
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => quickDemoLogin('admin')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all group"
              >
                <Shield className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span>Enter as Admin / Librarian</span>
              </button>
              <button
                onClick={() => quickDemoLogin('user')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all group"
              >
                <Users className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span>Enter as Student Member</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Pre-configured demo database with 22 textbooks, loans, overdues, and fines.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Catalog Preview */}
      <section className="py-12 px-6 sm:px-12 lg:px-20 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Real-time Catalog</span>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Featured University Textbooks</h2>
            </div>
            <button
              onClick={onGoLogin}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800"
            >
              <span>Explore All Books</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredBooks.map((b) => (
              <div
                key={b.id}
                onClick={onGoLogin}
                className="p-3 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between bg-slate-50/40"
              >
                <div>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                    <img
                      src={b.cover_image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80'}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block truncate">
                    {b.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 mt-0.5 group-hover:text-blue-600" title={b.title}>
                    {b.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{b.author}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <span className={`font-bold ${b.available_copies > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {b.available_copies > 0 ? `${b.available_copies} available` : 'Out of stock'}
                  </span>
                  <span className="text-[11px] text-blue-600 font-semibold group-hover:underline">
                    Borrow &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-6 sm:px-12 lg:px-20 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Enterprise Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Engineered For University Library Demands
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">ACID Issue & Return Pipeline</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated workflows ensure physical stock copies are accurately decremented only upon librarian approval, eliminating inventory drift.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Transparent Fine Calculation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated daily fine sync at ₹5 per overdue day with distinct Cashier Paid and Unpaid status tracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Complete UML Project Design</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Built-in diagrams for Use Case, Class, Sequence, Activity, Component, and Deployment diagrams ready for university evaluation and viva.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 px-6 sm:px-12 text-xs border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Library className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-white">UniLibrary Management System</span>
            <span>• Full-Stack Academic Project</span>
          </div>
          <p>© 2026 University Library Systems. Built with React, TypeScript, Express, and SQLite.</p>
        </div>
      </footer>
    </div>
  );
};
