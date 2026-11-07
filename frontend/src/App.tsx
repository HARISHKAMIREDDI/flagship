import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import PortfolioPage from './pages/PortfolioPage';
import AdminDashboard from './pages/AdminDashboard';
import { Shield, Terminal } from 'lucide-react';


function NavigationHeader() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="bg-[#12131a]/70 backdrop-blur-md border border-[#1f212e]/80 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
        <Link to="/" className="flex items-center gap-2 group">
          <Terminal className="w-5 h-5 text-violet-500 group-hover:rotate-6 transition-transform" />
          <span className="font-bold text-xs tracking-wider text-white uppercase">Harish.AI</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-xs font-medium hover:text-white transition-colors ${
              !isAdmin ? 'text-violet-400 font-semibold' : 'text-gray-400'
            }`}
          >
            Portfolio
          </Link>
          <Link 
            to="/admin" 
            className={`flex items-center gap-1.5 text-xs font-medium hover:text-white transition-colors ${
              isAdmin ? 'text-violet-400 font-semibold' : 'text-gray-400'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
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
