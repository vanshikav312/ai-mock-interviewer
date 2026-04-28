'use client';
import { useRouter } from 'next/navigation';

const VERDICT_STYLES = {
  'Strong Hire': 'bg-razor-green/20 border-razor-green text-razor-green',
  'Hire': 'bg-blue-500/20 border-blue-500 text-blue-300',
  'Maybe': 'bg-razor-peach/20 border-razor-peach text-razor-peach',
  'No Hire': 'bg-red-500/20 border-red-500 text-red-400',
};

const GRADE_COLORS = { A: 'text-razor-green', B: 'text-blue-400', C: 'text-razor-peach', D: 'text-red-400' };

export default function FinalReport({ report, role, difficulty, onSave, saving, saved }) {
  const router = useRouter();
  if (!report) return null;
  const { overallScore, grade, summary, topStrengths, criticalGaps, studyTopics, hiringVerdict, nextSteps } = report;

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[100px] bg-razor-accent/20 blur-[60px] pointer-events-none" />
        
        <p className="text-razor-green font-bold text-sm mb-3 tracking-widest uppercase relative z-10">{role} • {difficulty}</p>
        <div className="flex items-center justify-center gap-8 mb-6 relative z-10">
          <div>
            <p className="text-7xl font-black text-white drop-shadow-md">{overallScore}</p>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Overall Score</p>
          </div>
          <div className="text-7xl font-black drop-shadow-md">
            <span className={GRADE_COLORS[grade] || 'text-white'}>{grade}</span>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1 text-center">Grade</p>
          </div>
        </div>
        <span className={`inline-block px-6 py-2 rounded-full border-2 font-black tracking-widest uppercase text-sm shadow-sm relative z-10 ${VERDICT_STYLES[hiringVerdict] || ''}`}>
          {hiringVerdict}
        </span>
        <p className="text-slate-300 text-base leading-relaxed mt-7 max-w-2xl mx-auto font-medium relative z-10">{summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-razor-green/10 border border-razor-green/30 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
          <h3 className="text-razor-green font-black mb-4 tracking-widest uppercase text-sm">✓ Top Strengths</h3>
          <ul className="space-y-3">
            {topStrengths?.map((s, i) => (
              <li key={i} className="text-slate-200 text-sm flex gap-3 font-medium"><span className="text-razor-green font-bold">•</span>{s}</li>
            ))}
          </ul>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
          <h3 className="text-red-400 font-black mb-4 tracking-widest uppercase text-sm">✗ Critical Gaps</h3>
          <ul className="space-y-3">
            {criticalGaps?.map((g, i) => (
              <li key={i} className="text-slate-200 text-sm flex gap-3 font-medium"><span className="text-red-400 font-bold">•</span>{g}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
        <h3 className="text-blue-400 font-black mb-4 tracking-widest uppercase text-sm">📚 Study Topics</h3>
        <div className="flex flex-wrap gap-2">
          {studyTopics?.map((t, i) => (
            <span key={i} className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">{t}</span>
          ))}
        </div>
      </div>

      <div className="bg-razor-accent/10 border border-razor-accent/30 rounded-2xl p-6 shadow-sm backdrop-blur-sm mb-8">
        <h3 className="text-razor-accent font-black mb-3 tracking-widest uppercase text-sm">🗓 Next Steps</h3>
        <p className="text-slate-200 text-sm leading-relaxed font-medium">{nextSteps}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <button onClick={onSave} disabled={saving || saved}
          className="flex-1 bg-razor-teal hover:bg-razor-teal/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-md border border-razor-accent/30 tracking-widest uppercase">
          {saved ? '✓ Report Saved' : saving ? 'Saving...' : '💾 Save Report'}
        </button>
        <button onClick={() => router.push('/interview/setup')}
          className="flex-1 bg-razor-peach hover:bg-razor-peach/90 text-razor-navy font-black py-4 rounded-xl transition-all duration-300 shadow-lg shadow-razor-peach/20 hover:shadow-razor-peach/40 transform hover:-translate-y-1 tracking-widest uppercase">
          Start New Interview 🚀
        </button>
      </div>
    </div>
  );
}
