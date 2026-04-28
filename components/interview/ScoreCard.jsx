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
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Answer Evaluation</h3>
        <span className={`px-4 py-1.5 rounded-full border text-sm font-bold ${VERDICT_STYLES[verdict] || VERDICT_STYLES['Average']}`}>
          {verdict}
        </span>
      </div>

      <div className="flex justify-around bg-slate-700/30 rounded-xl p-4">
        <ScoreCircle label="Overall" score={score} color="border-purple-500" />
        <ScoreCircle label="Clarity" score={clarity} color="border-blue-500" />
        <ScoreCircle label="Technical" score={technical} color="border-emerald-500" />
        <ScoreCircle label="Relevance" score={relevance} color="border-amber-500" />
      </div>

      {fillerWordCount > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <p className="text-orange-300 text-sm font-medium mb-1">⚠️ Filler Words Detected: {fillerWordCount}</p>
          <p className="text-orange-400 text-xs">{fillerWords?.map(f => `"${f.word}" ×${f.count}`).join(', ')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-2">✓ Strengths</p>
          <p className="text-slate-300 text-sm leading-relaxed">{strengths}</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-2">↑ Improvements</p>
          <p className="text-slate-300 text-sm leading-relaxed">{improvements}</p>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-wide mb-2">★ Ideal Answer</p>
          <p className="text-slate-300 text-sm leading-relaxed">{idealAnswer}</p>
        </div>
      </div>

      <button onClick={onNext}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200">
        {isLast ? 'View Final Report →' : 'Next Question →'}
      </button>
    </div>
  );
}
