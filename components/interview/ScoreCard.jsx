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

  const VERDICT_STYLES = {
    'Excellent': 'bg-razor-green/20 border-razor-green/50 text-razor-green',
    'Good': 'bg-blue-500/20 border-blue-500/50 text-blue-300',
    'Average': 'bg-razor-peach/20 border-razor-peach/50 text-razor-peach',
    'Needs Work': 'bg-red-500/20 border-red-500/50 text-red-300',
  };

  return (
    <div className="glass-panel rounded-2xl p-7 space-y-7 animate-slide-up">
      <div className="flex items-center justify-between pb-3 border-b border-razor-teal/50">
        <h3 className="text-xl font-black text-white tracking-wide">Evaluation</h3>
        <span className={`px-4 py-1.5 rounded-full border text-sm font-bold shadow-sm ${VERDICT_STYLES[verdict] || VERDICT_STYLES['Average']}`}>
          {verdict}
        </span>
      </div>

      <div className="flex justify-around bg-razor-navy/40 rounded-2xl p-6 shadow-inner border border-razor-teal/50">
        <ScoreCircle label="Overall" score={score} color="border-razor-accent shadow-[0_0_15px_rgba(20,141,141,0.4)]" />
        <ScoreCircle label="Clarity" score={clarity} color="border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
        <ScoreCircle label="Technical" score={technical} color="border-razor-green shadow-[0_0_15px_rgba(193,225,167,0.4)]" />
        <ScoreCircle label="Relevance" score={relevance} color="border-razor-peach shadow-[0_0_15px_rgba(239,188,117,0.4)]" />
      </div>

      {fillerWordCount > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 shadow-sm backdrop-blur-sm">
          <p className="text-red-400 text-sm font-bold mb-1 tracking-wide">⚠️ Filler Words Detected: {fillerWordCount}</p>
          <p className="text-red-300/80 text-xs font-medium">{fillerWords?.map(f => `"${f.word}" ×${f.count}`).join(', ')}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        <div className="bg-razor-green/5 border border-razor-green/20 rounded-xl p-5 shadow-sm transition-colors hover:bg-razor-green/10">
          <p className="text-razor-green text-xs font-bold uppercase tracking-widest mb-3 opacity-90">✓ Strengths</p>
          <p className="text-slate-200 text-sm leading-relaxed font-medium">{strengths}</p>
        </div>
        <div className="bg-razor-peach/5 border border-razor-peach/20 rounded-xl p-5 shadow-sm transition-colors hover:bg-razor-peach/10">
          <p className="text-razor-peach text-xs font-bold uppercase tracking-widest mb-3 opacity-90">↑ Improvements</p>
          <p className="text-slate-200 text-sm leading-relaxed font-medium">{improvements}</p>
        </div>
        <div className="bg-razor-accent/5 border border-razor-accent/20 rounded-xl p-5 shadow-sm transition-colors hover:bg-razor-accent/10">
          <p className="text-razor-accent text-xs font-bold uppercase tracking-widest mb-3 opacity-90">★ Ideal Answer</p>
          <p className="text-slate-200 text-sm leading-relaxed font-medium">{idealAnswer}</p>
        </div>
      </div>

      <button onClick={onNext}
        className="w-full bg-razor-peach hover:bg-razor-peach/90 text-razor-navy font-black py-4 rounded-xl transition-all duration-300 shadow-lg shadow-razor-peach/20 hover:shadow-razor-peach/40 transform active:scale-[0.99] tracking-widest uppercase mt-2">
        {isLast ? 'View Final Report 📊' : 'Next Question →'}
      </button>
    </div>
  );
}
