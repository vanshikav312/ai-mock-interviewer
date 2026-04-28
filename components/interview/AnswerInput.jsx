'use client';

export default function AnswerInput({ answer, setAnswer, onSubmit, onHint, loading, hintLoading }) {
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <label className="text-slate-300 font-medium">Your Answer</label>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          wordCount < 20 ? 'bg-red-500/20 text-red-400' :
          wordCount < 60 ? 'bg-amber-500/20 text-amber-400' :
          'bg-emerald-500/20 text-emerald-400'
        }`}>
          {wordCount} words
        </span>
      </div>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer here... Be detailed and specific. Aim for at least 60 words."
        rows={7}
        className="w-full bg-slate-700/40 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-slate-500 resize-none text-sm leading-relaxed"
      />

      <div className="flex gap-3 mt-4">
        <button onClick={onHint} disabled={hintLoading || loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {hintLoading ? (
            <span className="animate-pulse">Getting hint...</span>
          ) : (
            <><span>💡</span> Get Hint</>
          )}
        </button>

        <button onClick={onSubmit} disabled={loading || !answer.trim() || hintLoading}
          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition-colors duration-200">
          {loading ? 'Evaluating...' : 'Submit Answer →'}
        </button>
      </div>
    </div>
  );
}
