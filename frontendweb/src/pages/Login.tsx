import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: { email: string; name: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate auth - in production, call your auth API
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Mock successful login
    const user = {
      email,
      name: name || email.split('@')[0],
    };
    
    localStorage.setItem('mindforge_user', JSON.stringify(user));
    onLogin(user);
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header */}
      <nav className="px-6 py-6">
        <Link to="/" className="text-xl font-semibold text-charcoal tracking-tight">
          mindforge
        </Link>
      </nav>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-charcoal mb-2">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-muted">
              {isSignUp ? 'Start getting smarter in 5 minutes a day' : 'Continue your learning journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="input"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="input"
              />
            </div>

            {error && (
              <p className="text-sm text-coral">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create account' : 'Sign in')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted hover:text-charcoal"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Demo login */}
          <div className="mt-8 pt-6 border-t border-cream-dark">
            <button
              onClick={() => {
                const demoUser = { email: 'demo@mindforge.app', name: 'Demo User' };
                localStorage.setItem('mindforge_user', JSON.stringify(demoUser));
                onLogin(demoUser);
                navigate('/dashboard');
              }}
              className="w-full text-center text-sm text-muted hover:text-charcoal"
            >
              Try demo account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
