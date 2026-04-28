'use client';

export default function HintBox({ hint, loading }) {
  if (!hint && !loading) return null;

  return (
    <div className="bg-razor-peach/10 backdrop-blur-md border border-razor-peach/30 rounded-2xl p-5 mb-8 animate-fade-in shadow-lg shadow-razor-peach/5">
      <div className="flex items-start gap-4">
        <div className="bg-razor-peach/20 p-2.5 rounded-xl border border-razor-peach/30 shadow-inner text-xl flex items-center justify-center">
          💡
        </div>
        <div className="flex-1 mt-1">
          <p className="text-razor-peach text-xs font-black uppercase tracking-widest mb-2 opacity-90">AI Hint</p>
          {loading && !hint ? (
            <div className="flex gap-2 mt-3 mb-1">
              <span className="w-2.5 h-2.5 bg-razor-peach/80 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '0ms' }} />
              <span className="w-2.5 h-2.5 bg-razor-peach/80 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '150ms' }} />
              <span className="w-2.5 h-2.5 bg-razor-peach/80 rounded-full animate-bounce shadow-sm" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className="text-slate-200 text-sm leading-relaxed font-medium">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
