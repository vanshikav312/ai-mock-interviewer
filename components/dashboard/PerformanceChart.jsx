'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="text-purple-400 font-bold">{payload[0].value} / 100</p>
      </div>
    );
  }
  return null;
};

export default function PerformanceChart({ sessions }) {
  const data = [...sessions]
    .reverse()
    .slice(-10)
    .map((s, i) => ({
      name: `#${i + 1} ${s.role?.split(' ')[0] || ''}`,
      score: s.overallScore || 0,
    }));

  if (data.length === 0) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 text-center mb-8">
        <p className="text-slate-400">Complete your first interview to see performance trends.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-8">
      <h2 className="text-white font-bold text-lg mb-6">Performance Over Time</h2>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone" dataKey="score" stroke="#a855f7"
            strokeWidth={2.5} dot={{ fill: '#a855f7', r: 4 }} activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
