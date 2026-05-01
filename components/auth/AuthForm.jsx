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
    <div className="min-h-screen bg-soft relative flex items-center justify-center p-6 overflow-hidden">
      {/* Soft background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-luxury/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="soft-card p-12 w-full max-w-lg shadow-elevated relative z-10 animate-slide-up">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-[40px] bg-white border border-depth/30 mb-10 shadow-inner-soft overflow-hidden p-3">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain animate-float" />
          </div>
          <h1 className="text-5xl font-black text-luxury mb-3 tracking-tighter leading-tight">
            {isLogin ? 'Welcome back.' : 'Create space.'}
          </h1>
          <p className="text-muted font-medium text-lg italic opacity-60">
            {isLogin ? 'Continue your path to mastery.' : 'Start your deep practice today.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl mb-8 animate-slide-up flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            <p className="text-red-600 text-xs font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-muted uppercase tracking-widest ml-4">Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} required
                className="w-full bg-soft border-2 border-transparent text-luxury rounded-pill px-8 py-4 focus:bg-white focus:border-luxury/10 focus:shadow-soft outline-none font-bold transition-all"
                placeholder="" />
            </div>
          )}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest ml-4">Email Address</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full bg-soft border-2 border-transparent text-luxury rounded-pill px-8 py-4 focus:bg-white focus:border-luxury/10 focus:shadow-soft outline-none font-bold transition-all"
              placeholder="" />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-muted uppercase tracking-widest ml-4">Secure Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required
              className="w-full bg-soft border-2 border-transparent text-luxury rounded-pill px-8 py-4 focus:bg-white focus:border-luxury/10 focus:shadow-soft outline-none font-bold transition-all"
              placeholder="" />
          </div>
          
          <button type="submit" disabled={loading}
            className="w-full pill-btn bg-luxury text-white py-5 shadow-soft hover:shadow-elevated hover:-translate-y-1 text-sm font-black tracking-widest uppercase transition-all mt-4">
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-depth/30" /></div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-[10px] font-black text-muted uppercase tracking-widest">or continue with</span>
          </div>
        </div>

        <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
          className="w-full pill-btn bg-white border-2 border-depth/30 text-luxury py-4 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 flex items-center justify-center gap-4 text-xs font-black tracking-widest uppercase">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Sign In with Google
        </button>

        <p className="text-center text-[10px] font-black uppercase tracking-widest mt-12 text-muted">
          {isLogin ? "New to the path? " : 'Already practiced? '}
          <Link href={isLogin ? '/register' : '/login'} className="text-accent hover:underline underline-offset-4 decoration-2">
            {isLogin ? 'Create Account' : 'Sign In'}
          </Link>
        </p>
      </div>
    </div>
  );
}
