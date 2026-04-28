'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-razor-navy border border-razor-teal rounded-xl p-4 shadow-2xl backdrop-blur-md">
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
        <p className="text-razor-accent font-black text-xl">{payload[0].value} <span className="text-sm text-slate-500">/ 100</span></p>
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
      <div className="glass-panel p-10 text-center mb-10 rounded-2xl border-dashed border-2 border-razor-teal/40">
        <p className="text-slate-400 font-medium">Complete your first interview to see performance trends.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-7 mb-10">
      <h2 className="text-white font-bold text-xl mb-7 flex items-center gap-2">
        <span>📈</span> Performance Trends
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A4A5A" vertical={false} />
          <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#148D8D', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Line
            type="monotone" dataKey="score" stroke="#148D8D"
            strokeWidth={3} dot={{ fill: '#0E2C40', stroke: '#148D8D', strokeWidth: 2, r: 5 }} activeDot={{ r: 7, fill: '#148D8D', stroke: '#C1E1A7', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
