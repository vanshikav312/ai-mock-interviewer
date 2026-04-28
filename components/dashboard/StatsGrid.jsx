'use client';

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-2xl p-6 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <StatCard label="Total Interviews" value={total} icon="🎯" color="bg-purple-500/20" />
      <StatCard label="Average Score" value={`${avgScore}/100`} icon="📊" color="bg-blue-500/20" />
      <StatCard label="Best Score" value={`${bestScore}/100`} icon="🏆" color="bg-emerald-500/20" />
    </div>
  );
}
