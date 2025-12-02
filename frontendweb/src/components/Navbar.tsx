import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { to: '/dashboard', label: 'Home' },
    { to: '/lessons', label: 'Lessons' },
    { to: '/generate', label: 'Generate' },
    { to: '/progress', label: 'Progress' },
  ];

  return (
    <nav className="bg-warm-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-cream-dark">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="text-xl font-semibold text-charcoal tracking-tight">
            mindforge
          </Link>
          
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

          <div className="flex items-center gap-3">
            <Link to="/achievements" className="p-2 rounded-xl hover:bg-cream-dark transition-colors">
              <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </Link>
            <div className="w-9 h-9 rounded-full bg-coral flex items-center justify-center text-white text-sm font-semibold">
              A
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
