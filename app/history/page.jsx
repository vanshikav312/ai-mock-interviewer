'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const VERDICT_COLORS = {
  'Strong Hire': 'text-emerald-600 bg-emerald-50 border-emerald-100', 
  'Hire': 'text-blue-600 bg-blue-50 border-blue-100',
  'Maybe': 'text-accent bg-accent/5 border-accent/10', 
  'No Hire': 'text-red-600 bg-red-50 border-red-100',
};

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/sessions')
        .then((r) => r.json())
        .then((d) => { setSessions(d.sessions || []); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-luxury/20 border-t-luxury rounded-full animate-spin shadow-soft" />
          <div className="text-luxury font-black tracking-widest text-xs uppercase animate-pulse">Loading History...</div>
        </div>
      </div>
    );
  }

  const firstName = session?.user?.name?.split(' ')[0] || 'Explorer';

  return (
    <div className="min-h-screen bg-soft selection:bg-luxury/10">
      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl">
        <div className="glass-panel px-8 py-4 rounded-pill flex items-center justify-between shadow-soft border border-depth/20">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
            <span className="font-black text-luxury tracking-tighter text-xl">AI Mock Interviewer</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="hidden sm:flex items-center gap-2 bg-luxury/5 px-4 py-2 rounded-pill border border-depth/30 hover:bg-luxury/10 transition-colors">
              <span className="text-luxury text-sm font-black tracking-tight">{firstName}</span>
            </Link>
            <Link href="/dashboard" className="text-muted hover:text-luxury text-xs font-black uppercase tracking-widest px-4 transition-colors">
              ← Dashboard
            </Link>
            <Link href="/interview/setup" className="pill-btn bg-luxury text-white px-8 py-2.5 text-sm shadow-soft hover:shadow-elevated transition-all">
              New Interview
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="mb-12 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-black text-luxury tracking-tighter leading-tight mb-4">
            Interview History
          </h1>
          <p className="text-muted text-lg font-medium">Review your past performances and track your growth over time.</p>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          {sessions.length === 0 ? (
            <div className="soft-card p-20 text-center border-dashed border-2 border-depth/40">
              <p className="text-muted font-bold text-lg mb-8">No interview history found.</p>
              <Link href="/interview/setup" className="pill-btn bg-accent text-white px-12 py-4 shadow-soft hover:shadow-elevated transition-all">
                Start First Interview
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sessions.map((s, i) => (
                <Link key={s._id} href={`/interview/report?id=${s._id}`} className="block soft-card p-8 !bg-[#0F3D2E] text-white hover:-translate-y-1 group relative overflow-hidden shadow-xl">
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                      <p className="text-white font-black text-xl mb-1 group-hover:text-accent transition-colors">{s.role}</p>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                        {s.difficulty} • {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-black text-white">{s.overallScore}<span className="text-[10px] text-white/40">/100</span></p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-xl text-accent">
                        {s.grade || 'A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-md border uppercase tracking-tighter ${VERDICT_COLORS[s.hiringVerdict] || 'text-white/60 bg-white/10 border-white/10'}`}>
                      {s.hiringVerdict || 'N/A'}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white group-hover:underline">
                      Analysis →
                    </span>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500 -z-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
