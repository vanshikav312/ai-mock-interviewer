'use client';

export default function HintBox({ hint, loading }) {
  if (!hint && !loading) return null;

  return (
    <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 rounded-2xl p-5 mb-6 animate-fade-in shadow-lg shadow-amber-500/5">
      <div className="flex items-start gap-4">
        <div className="bg-amber-500/20 p-2 rounded-xl border border-amber-500/30 shadow-inner">
          <span className="text-xl">💡</span>
        </div>
        <div className="flex-1 mt-1">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2 opacity-90">AI Hint</p>
          {loading && !hint ? (
            <div className="flex gap-1.5 mt-3 mb-1">
              <span className="w-2 h-2 bg-amber-400/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-amber-400/80 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-amber-400/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className="text-amber-100/90 text-sm leading-relaxed font-medium">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
