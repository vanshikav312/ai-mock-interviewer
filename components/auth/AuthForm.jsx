'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthForm({ mode }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isLogin = mode === 'login';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const res = await signIn('credentials', {
          email: form.email,
          password: form.password,
          redirect: false,
        });
        if (res?.error) { setError('Invalid email or password'); return; }
        router.push('/dashboard');
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Registration failed'); return; }
        await signIn('credentials', { email: form.email, password: form.password, redirect: false });
        router.push('/dashboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-razor-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-razor-peach/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="glass-panel p-10 w-full max-w-md shadow-2xl relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-razor-navy/50 border border-razor-teal mb-4 shadow-inner">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-300 font-medium">{isLogin ? 'Sign in to continue your prep' : 'Start your interview journey'}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-widest mb-1.5">Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} required
                className="w-full bg-razor-navy/60 border border-razor-teal text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-razor-accent/50 focus:border-razor-accent placeholder-slate-500 shadow-inner font-medium transition-all duration-300"
                placeholder="John Doe" />
            </div>
          )}
          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-widest mb-1.5">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full bg-razor-navy/60 border border-razor-teal text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-razor-accent/50 focus:border-razor-accent placeholder-slate-500 shadow-inner font-medium transition-all duration-300"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-slate-300 text-xs font-bold uppercase tracking-widest mb-1.5">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required
              className="w-full bg-razor-navy/60 border border-razor-teal text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-razor-accent/50 focus:border-razor-accent placeholder-slate-500 shadow-inner font-medium transition-all duration-300"
              placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-razor-peach hover:bg-razor-peach/90 disabled:opacity-50 disabled:cursor-not-allowed text-razor-navy font-black py-4 rounded-xl transition-all duration-300 mt-2 shadow-lg shadow-razor-peach/20 hover:shadow-razor-peach/40 tracking-widest uppercase transform active:scale-[0.98]">
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-razor-teal" /></div>
          <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
            <span className="bg-razor-navy px-3 text-slate-400">or continue with</span>
          </div>
        </div>

        <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-black py-3.5 rounded-xl transition-all duration-300 shadow-sm border border-transparent hover:border-slate-300 transform active:scale-[0.98]">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Google
        </button>

        <p className="text-center text-slate-400 text-sm mt-8 font-medium">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link href={isLogin ? '/register' : '/login'} className="text-razor-accent hover:text-razor-accent/80 font-bold transition-colors">
            {isLogin ? 'Sign up' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
}
