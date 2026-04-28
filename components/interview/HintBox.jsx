'use client';

export default function HintBox({ hint, loading }) {
  if (!hint && !loading) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-wide mb-1">Hint</p>
          {loading && !hint ? (
            <div className="flex gap-1 mt-2">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className="text-slate-300 text-sm leading-relaxed">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
