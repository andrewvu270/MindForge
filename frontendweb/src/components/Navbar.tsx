import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { to: '/dashboard', label: 'Home' },
    { to: '/lessons', label: 'Lessons' },
    { to: '/flashcards', label: 'Flashcards' },
    { to: '/reflection', label: 'Reflect' },
    { to: '/progress', label: 'Progress' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('mindforge_user');
    navigate('/');
    window.location.reload();
  };

  const user = JSON.parse(localStorage.getItem('mindforge_user') || '{}');

  return (
    <nav className="bg-warm-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-cream-dark">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-semibold text-charcoal tracking-tight">
            mindforge
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(item.to)
                    ? 'bg-charcoal text-white'
                    : 'text-muted hover:text-charcoal hover:bg-cream-dark'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden p-2 rounded-xl hover:bg-cream-dark transition-colors"
          >
            <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showMenu ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/generate"
              className="p-2 rounded-xl hover:bg-cream-dark transition-colors"
              title="Generate Lesson"
            >
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-full bg-coral flex items-center justify-center text-white text-sm font-medium"
              >
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-warm-white rounded-xl shadow-lg border border-cream-dark z-50">
                    <div className="p-3 border-b border-cream-dark">
                      <p className="font-medium text-charcoal text-sm">{user.name || 'User'}</p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/progress"
                        onClick={() => setShowMenu(false)}
                        className="block px-3 py-2 text-sm text-charcoal hover:bg-cream-dark rounded-lg"
                      >
                        Your progress
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-coral hover:bg-cream-dark rounded-lg"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="md:hidden mt-4 pb-4 border-t border-cream-dark pt-4">
            {/* User Profile Section */}
            <div className="px-4 py-3 mb-3 bg-cream-dark rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center text-white font-medium">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal text-sm truncate">{user.name || 'User'}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setShowMenu(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(item.to)
                      ? 'bg-charcoal text-white'
                      : 'text-muted hover:text-charcoal hover:bg-cream-dark'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/generate"
                onClick={() => setShowMenu(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-charcoal hover:bg-cream-dark transition-all"
              >
                Generate Lesson
              </Link>
              
              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-3 rounded-xl text-sm font-medium text-coral hover:bg-cream-dark transition-all text-left"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
