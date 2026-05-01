'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-luxury/20 rounded-xl p-4 shadow-2xl backdrop-blur-md">
        <p className="text-luxury/60 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
        <p className="text-luxury font-black text-xl">{payload[0].value} <span className="text-sm text-luxury/40">/ 100</span></p>
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
      <div className="glass-panel p-10 text-center mb-10 rounded-2xl border-dashed border-2 border-luxury/20">
        <p className="text-luxury/60 font-medium">Complete your first interview to see performance trends.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-7 mb-10">
      <h2 className="text-luxury font-bold text-xl mb-7 flex items-center gap-2">
        Performance Trends
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0F3D2E" vertical={false} opacity={0.1} />
          <XAxis dataKey="name" stroke="#0F3D2E" tick={{ fontSize: 12, fill: '#0F3D2E' }} tickLine={false} axisLine={false} opacity={0.8} />
          <YAxis domain={[0, 100]} stroke="#0F3D2E" tick={{ fontSize: 12, fill: '#0F3D2E' }} tickLine={false} axisLine={false} opacity={0.8} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#0F3D2E', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Line
            type="monotone" dataKey="score" stroke="#0F3D2E"
            strokeWidth={3} dot={{ fill: '#0F3D2E', stroke: '#0F3D2E', strokeWidth: 2, r: 5 }} activeDot={{ r: 7, fill: '#0F3D2E', stroke: '#A3BFA8', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
