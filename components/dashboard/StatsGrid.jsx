'use client';

function StatCard({ label, value, icon, colorClass, borderClass }) {
  return (
    <div className={`glass-panel p-6 flex items-center gap-5 rounded-2xl hover:-translate-y-1 transition-transform duration-300 ${borderClass}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-300 font-medium text-sm tracking-wide mb-1 uppercase">{label}</p>
        <p className="text-white text-3xl font-black">{value}</p>
      </div>
    </div>
  );
}

export default function StatsGrid({ sessions }) {
  const total = sessions.length;
  const avgScore = total
    ? Math.round(sessions.reduce((s, ses) => s + (ses.overallScore || 0), 0) / total)
    : 0;
  const bestScore = total ? Math.max(...sessions.map((s) => s.overallScore || 0)) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
      <StatCard label="Total Interviews" value={total} icon="🎯" colorClass="bg-razor-accent/20 text-razor-accent border border-razor-accent/30" borderClass="hover:border-razor-accent/50" />
      <StatCard label="Average Score" value={`${avgScore}/100`} icon="📈" colorClass="bg-blue-500/20 text-blue-400 border border-blue-500/30" borderClass="hover:border-blue-500/50" />
      <StatCard label="Best Score" value={`${bestScore}/100`} icon="🏆" colorClass="bg-razor-peach/20 text-razor-peach border border-razor-peach/30" borderClass="hover:border-razor-peach/50" />
    </div>
  );
}
