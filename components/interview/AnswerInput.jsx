'use client';

export default function AnswerInput({ answer, setAnswer, onSubmit, onHint, loading, hintLoading, error }) {
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-600">
      <div className="flex items-center justify-between mb-3">
        <label className="text-slate-300 font-medium tracking-wide">Your Answer</label>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full shadow-inner ${
          wordCount < 20 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          wordCount < 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
        }`}>
          {wordCount} words
        </span>
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here... Be detailed and specific. Aim for at least 60 words."
        rows={7}
        className="w-full bg-slate-900/50 border border-slate-600/50 text-slate-100 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-slate-500 resize-none text-sm leading-relaxed transition-all duration-300"
      />

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="text-red-400 text-lg mt-0.5">⚠️</span>
          <div>
            <h4 className="text-red-400 font-medium text-sm">Submission Failed</h4>
            <p className="text-red-400/80 text-xs mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-5">
        <button onClick={onHint} disabled={hintLoading || loading}
          className="flex items-center justify-center min-w-[120px] gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-amber-500/50 text-slate-300 hover:text-amber-400 rounded-xl text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm">
          {hintLoading ? (
            <span className="animate-pulse">Getting hint...</span>
          ) : (
            <><span className="group-hover:scale-110 transition-transform">💡</span> Get Hint</>
          )}
        </button>

        <button onClick={onSubmit} disabled={loading || !answer.trim() || hintLoading}
          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all duration-300 transform active:scale-[0.98]">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Evaluating...
            </span>
          ) : (
            'Submit Answer →'
          )}
        </button>
      </div>
    </div>
  );
}
