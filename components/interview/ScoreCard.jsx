'use client';

const VERDICT_STYLES = {
  Excellent: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
  Good: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  Average: 'bg-amber-500/20 border-amber-500/50 text-amber-300',
  'Needs Work': 'bg-red-500/20 border-red-500/50 text-red-300',
};

function ScoreCircle({ label, score, color }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-16 h-16 rounded-full border-4 ${color} flex items-center justify-center mb-1`}>
        <span className="text-white font-bold text-lg">{score}</span>
      </div>
      <span className="text-slate-400 text-xs text-center">{label}</span>
    </div>
  );
}

export default function ScoreCard({ evaluation, onNext, isLast }) {
  if (!evaluation) return null;
  const { score, clarity, technical, relevance, strengths, improvements, idealAnswer, verdict, fillerWordCount, fillerWords } = evaluation;

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6 animate-slide-up">
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
        <h3 className="text-xl font-bold text-white tracking-wide">Evaluation</h3>
        <span className={`px-4 py-1.5 rounded-full border text-sm font-bold shadow-sm ${VERDICT_STYLES[verdict] || VERDICT_STYLES['Average']}`}>
          {verdict}
        </span>
      </div>

      <div className="flex justify-around bg-slate-900/50 rounded-2xl p-6 shadow-inner border border-slate-700/50">
        <ScoreCircle label="Overall" score={score} color="border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
        <ScoreCircle label="Clarity" score={clarity} color="border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
        <ScoreCircle label="Technical" score={technical} color="border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
        <ScoreCircle label="Relevance" score={relevance} color="border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
      </div>

      {fillerWordCount > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 shadow-sm backdrop-blur-sm">
          <p className="text-orange-400 text-sm font-bold mb-1 tracking-wide">⚠️ Filler Words Detected: {fillerWordCount}</p>
          <p className="text-orange-300/80 text-xs font-medium">{fillerWords?.map(f => `"${f.word}" ×${f.count}`).join(', ')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 shadow-sm transition-colors hover:bg-emerald-500/10">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3 opacity-90">✓ Strengths</p>
          <p className="text-slate-300 text-sm leading-relaxed font-medium">{strengths}</p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 shadow-sm transition-colors hover:bg-amber-500/10">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-3 opacity-90">↑ Improvements</p>
          <p className="text-slate-300 text-sm leading-relaxed font-medium">{improvements}</p>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 shadow-sm transition-colors hover:bg-blue-500/10">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3 opacity-90">★ Ideal Answer</p>
          <p className="text-slate-300 text-sm leading-relaxed font-medium">{idealAnswer}</p>
        </div>
      </div>

      <button onClick={onNext}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform active:scale-[0.99] tracking-wide mt-2">
        {isLast ? 'View Final Report →' : 'Next Question →'}
      </button>
    </div>
  );
}
