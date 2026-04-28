'use client';
import { useRouter } from 'next/navigation';

const VERDICT_STYLES = {
  'Strong Hire': 'bg-emerald-500/20 border-emerald-500 text-emerald-300',
  'Hire': 'bg-blue-500/20 border-blue-500 text-blue-300',
  'Maybe': 'bg-amber-500/20 border-amber-500 text-amber-300',
  'No Hire': 'bg-red-500/20 border-red-500 text-red-300',
};

const GRADE_COLORS = { A: 'text-emerald-400', B: 'text-blue-400', C: 'text-amber-400', D: 'text-red-400' };

export default function FinalReport({ report, role, difficulty, onSave, saving, saved }) {
  const router = useRouter();
  if (!report) return null;
  const { overallScore, grade, summary, topStrengths, criticalGaps, studyTopics, hiringVerdict, nextSteps } = report;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 text-center">
        <p className="text-slate-400 text-sm mb-2">{role} · {difficulty}</p>
        <div className="flex items-center justify-center gap-6 mb-4">
          <div>
            <p className="text-6xl font-black text-white">{overallScore}</p>
            <p className="text-slate-400 text-sm">Overall Score</p>
          </div>
          <div className="text-6xl font-black">
            <span className={GRADE_COLORS[grade] || 'text-white'}>{grade}</span>
          </div>
        </div>
        <span className={`inline-block px-6 py-2 rounded-full border-2 font-bold text-lg ${VERDICT_STYLES[hiringVerdict] || ''}`}>
          {hiringVerdict}
        </span>
        <p className="text-slate-300 text-sm leading-relaxed mt-5 max-w-xl mx-auto">{summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
          <h3 className="text-emerald-400 font-bold mb-3">✓ Top Strengths</h3>
          <ul className="space-y-2">
            {topStrengths?.map((s, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-2"><span className="text-emerald-400">•</span>{s}</li>
            ))}
          </ul>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
          <h3 className="text-red-400 font-bold mb-3">✗ Critical Gaps</h3>
          <ul className="space-y-2">
            {criticalGaps?.map((g, i) => (
              <li key={i} className="text-slate-300 text-sm flex gap-2"><span className="text-red-400">•</span>{g}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
        <h3 className="text-blue-400 font-bold mb-3">📚 Study Topics</h3>
        <div className="flex flex-wrap gap-2">
          {studyTopics?.map((t, i) => (
            <span key={i} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">{t}</span>
          ))}
        </div>
      </div>

      <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5">
        <h3 className="text-purple-400 font-bold mb-3">🗓 Next 2 Weeks Plan</h3>
        <p className="text-slate-300 text-sm leading-relaxed">{nextSteps}</p>
      </div>

      <div className="flex gap-4">
        <button onClick={onSave} disabled={saving || saved}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors">
          {saved ? '✓ Report Saved!' : saving ? 'Saving...' : 'Save Report'}
        </button>
        <button onClick={() => router.push('/interview/setup')}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors">
          Start New Interview
        </button>
      </div>
    </div>
  );
}
