import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PortfolioPage from './pages/PortfolioPage';
import AdminDashboard from './pages/AdminDashboard';
import AIOrb from './components/AIOrb';
import { Shield } from 'lucide-react';

function NavigationHeader() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 pointer-events-auto">
      <div className="bg-[#0b0d18]/80 backdrop-blur-xl border border-[#20253b]/90 rounded-full px-5 py-2.5 flex items-center justify-between shadow-[0_10px_35px_-5px_rgba(0,0,0,0.7)] transition-all hover:border-violet-500/40">
        <Link to="/" className="flex items-center gap-3 group">
          <AIOrb size="xs" isActive={true} />
          <div className="flex flex-col">
            <span className="font-mono font-bold text-xs tracking-wider text-white group-hover:text-cyan-300 transition-colors uppercase flex items-center gap-1.5">
              KAIROS
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              !isAdmin
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Portfolio
          </Link>
          <Link
            to="/admin"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              isAdmin
                ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40 shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3 text-cyan-400" />
            CMS Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <Router>
      <NavigationHeader />
      <Routes>
        <Route path="/" element={<PortfolioPage />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
