'use client';

const VERDICT_STYLES = {
  'Excellent': 'bg-emerald-50 border-emerald-200 text-emerald-600',
  'Good': 'bg-blue-50 border-blue-200 text-blue-600',
  'Average': 'bg-accent/5 border-accent/20 text-accent',
  'Needs Work': 'bg-red-50 border-red-200 text-red-600',
};

function ScoreCircle({ label, score, color }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-20 h-20 rounded-full border-4 ${color} flex items-center justify-center mb-2 bg-soft shadow-inner-soft`}>
        <span className="text-luxury font-black text-xl">{score}</span>
      </div>
      <span className="text-[10px] font-black text-muted uppercase tracking-widest text-center">{label}</span>
    </div>
  );
}

export default function ScoreCard({ evaluation, onNext, isLast }) {
  if (!evaluation) return null;
  const { score, clarity, technical, relevance, strengths, improvements, idealAnswer, verdict, fillerWordCount, fillerWords } = evaluation;

  return (
    <div className="soft-card p-10 space-y-10 animate-slide-up relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-depth/30">
        <h3 className="text-3xl font-black text-luxury tracking-tighter">Evaluation</h3>
        <span className={`px-6 py-2 rounded-pill border-2 text-xs font-black uppercase tracking-widest shadow-soft ${VERDICT_STYLES[verdict] || VERDICT_STYLES['Average']}`}>
          {verdict}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-4">
        <ScoreCircle label="Overall" score={score} color="border-luxury shadow-soft" />
        <ScoreCircle label="Clarity" score={clarity} color="border-blue-200" />
        <ScoreCircle label="Technical" score={technical} color="border-sage/40" />
        <ScoreCircle label="Relevance" score={relevance} color="border-accent/40" />
      </div>

      {fillerWordCount > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow-inner-soft">
          <p className="text-red-700 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
            Filler Words: {fillerWordCount}
          </p>
          <div className="flex flex-wrap gap-2">
            {fillerWords?.map((f, i) => (
              <span key={i} className="text-[10px] font-bold bg-white px-3 py-1 rounded-pill border border-red-100 text-red-600">
                "{f.word}" ×{f.count}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-soft border border-depth/30 rounded-3xl p-8 hover:bg-white transition-colors group">
          <p className="text-luxury text-[10px] font-black uppercase tracking-widest mb-4 opacity-50 group-hover:opacity-100">✓ Strengths</p>
          <p className="text-luxury text-sm leading-relaxed font-medium">{strengths}</p>
        </div>
        <div className="bg-accent/5 border border-accent/10 rounded-3xl p-8 hover:bg-white transition-colors group">
          <p className="text-accent text-[10px] font-black uppercase tracking-widest mb-4 opacity-50 group-hover:opacity-100">↑ Improvements</p>
          <p className="text-luxury text-sm leading-relaxed font-medium">{improvements}</p>
        </div>
        <div className="bg-luxury/5 border border-luxury/10 rounded-3xl p-8 hover:bg-white transition-colors group">
          <p className="text-luxury text-[10px] font-black uppercase tracking-widest mb-4 opacity-50 group-hover:opacity-100">★ Ideal Perspective</p>
          <p className="text-luxury text-sm leading-relaxed font-medium">{idealAnswer}</p>
        </div>
      </div>

      <button onClick={onNext}
        className="w-full pill-btn bg-accent text-white py-6 shadow-soft hover:shadow-elevated hover:-translate-y-1 text-sm font-black tracking-widest uppercase transition-all">
        {isLast ? 'View Full Report' : 'Next Question →'}
      </button>
    </div>
  );
}
