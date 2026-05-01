'use client';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StatsGrid from '@/components/dashboard/StatsGrid';
import PerformanceChart from '@/components/dashboard/PerformanceChart';

const VERDICT_COLORS = {
  'Strong Hire': 'text-emerald-600 bg-emerald-50 border-emerald-100', 
  'Hire': 'text-blue-600 bg-blue-50 border-blue-100',
  'Maybe': 'text-accent bg-accent/5 border-accent/10', 
  'No Hire': 'text-red-600 bg-red-50 border-red-100',
};

export default function DashboardPage() {
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
          <div className="text-luxury font-black tracking-widest text-xs uppercase animate-pulse">Refining Dashboard...</div>
        </div>
      </div>
    );
  }

  const recentSessions = sessions.slice(0, 5);
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
            <div className="hidden sm:flex items-center gap-2 bg-luxury/5 px-4 py-2 rounded-pill border border-depth/30">
              <span className="text-luxury text-sm font-black tracking-tight">{firstName}</span>
            </div>
            <button onClick={() => signOut({ callbackUrl: '/' })} className="text-muted hover:text-luxury text-xs font-black uppercase tracking-widest px-4 transition-colors">
              Exit
            </button>
            <Link href="/interview/setup" className="pill-btn bg-luxury text-white px-8 py-2.5 text-sm shadow-soft hover:shadow-elevated transition-all">
              Start Interview
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Welcome Section with Hero Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8 space-y-4 animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-black text-luxury tracking-tighter leading-tight">
              Ready to rise,<br />{firstName}?
            </h1>
            <p className="text-muted text-lg font-medium">Your progress is tactile. Every session brings you closer to mastery.</p>
          </div>
          
          <div className="lg:col-span-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="soft-card-elevated bg-gradient-to-br from-luxury to-accent p-8 text-white h-full flex flex-col justify-between relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-2">Daily Focus</p>
                <h3 className="text-2xl font-black mb-4">Complete 1 Mock Interview</h3>
                <div className="flex items-center gap-4">
                  <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white w-[30%]" />
                  </div>
                  <span className="text-xs font-bold text-white/90">30% Done</span>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            </div>
          </div>
        </div>

        {/* Today Section - Mixed Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-2 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="soft-card p-1">
              <PerformanceChart sessions={sessions} />
            </div>
          </div>
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="soft-card p-8 hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-soft flex items-center justify-center text-2xl shadow-inner-soft opacity-20">•</div>
                <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-md border border-emerald-100">+12%</span>
              </div>
              <p className="text-muted text-xs font-black uppercase tracking-widest mb-1">Avg. Score</p>
              <p className="text-3xl font-black text-luxury">84/100</p>
            </div>
            <div className="soft-card p-8 hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-soft flex items-center justify-center text-2xl shadow-inner-soft opacity-20">•</div>
                <span className="text-[10px] font-black bg-accent/5 text-accent px-2 py-1 rounded-md border border-accent/10">Active</span>
              </div>
              <p className="text-muted text-xs font-black uppercase tracking-widest mb-1">Role Path</p>
              <p className="text-2xl font-black text-luxury">Senior Architect</p>
            </div>
          </div>
        </div>

        {/* History Section - Floating Cards */}
        <div className="space-y-8 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-luxury tracking-tighter">Recent activity</h2>
            <Link href="/history" className="text-xs font-black uppercase tracking-widest text-muted hover:text-luxury transition-colors">View All →</Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="soft-card p-20 text-center border-dashed border-2 border-depth/40">
              <p className="text-muted font-bold text-lg mb-8">The canvas is blank. Let's build your story.</p>
              <Link href="/interview/setup" className="pill-btn bg-accent text-white px-12 py-4 shadow-soft hover:shadow-elevated transition-all">
                Start First Interview
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentSessions.map((s, i) => (
                <div key={s._id} className="soft-card p-8 !bg-[#0F3D2E] text-white hover:-translate-y-1 group relative overflow-hidden shadow-xl">
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
                    <Link href={`/interview/report?id=${s._id}`} className="text-[10px] font-black uppercase tracking-widest text-white group-hover:underline">
                      Analysis →
                    </Link>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500 -z-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
