'use client';

export default function AnswerInput({ answer, setAnswer, onSubmit, onHint, loading, hintLoading, error }) {
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="glass-panel rounded-2xl p-7 mb-8 transition-all duration-300 hover:border-razor-accent/40 hover:shadow-razor-accent/5 group">
      <div className="flex items-center justify-between mb-4">
        <label className="text-slate-300 font-bold tracking-widest uppercase text-sm">Your Answer</label>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-inner ${
          wordCount < 20 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          wordCount < 60 ? 'bg-razor-peach/20 text-razor-peach border border-razor-peach/30' :
          'bg-razor-green/20 text-razor-green border border-razor-green/30'
        }`}>
          {wordCount} words
        </span>
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here... Be detailed and specific. Aim for at least 60 words."
        rows={7}
        className="w-full bg-razor-navy/60 border border-razor-teal/70 text-white rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-razor-accent/50 focus:border-razor-accent placeholder-slate-500 resize-none text-sm leading-relaxed transition-all duration-300 shadow-inner font-medium"
      />

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-inner">
          <span className="text-red-400 text-lg mt-0.5">⚠️</span>
          <div>
            <h4 className="text-red-400 font-bold text-sm tracking-wide">Submission Failed</h4>
            <p className="text-red-300 text-xs mt-1 leading-relaxed font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <button onClick={onHint} disabled={hintLoading || loading}
          className="flex items-center justify-center min-w-[130px] gap-2 px-5 py-3.5 bg-razor-teal/40 hover:bg-razor-teal/70 border border-razor-accent/30 hover:border-razor-peach/50 text-slate-300 hover:text-razor-peach rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm">
          {hintLoading ? (
            <span className="animate-pulse tracking-wide">Getting hint...</span>
          ) : (
            <><span className="group-hover:scale-110 transition-transform">💡</span> Get Hint</>
          )}
        </button>

        <button onClick={onSubmit} disabled={loading || !answer.trim() || hintLoading}
          className="flex-1 bg-razor-peach hover:bg-razor-peach/90 disabled:opacity-50 disabled:cursor-not-allowed text-razor-navy font-black py-3.5 rounded-xl text-sm shadow-lg shadow-razor-peach/20 hover:shadow-razor-peach/40 transition-all duration-300 transform active:scale-[0.98] tracking-widest uppercase">
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-razor-navy/30 border-t-razor-navy rounded-full animate-spin" />
              Evaluating...
            </span>
          ) : (
            'Submit Answer 🚀'
          )}
        </button>
      </div>
    </div>
  );
}
