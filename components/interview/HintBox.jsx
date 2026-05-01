'use client';

export default function HintBox({ hint, loading }) {
  if (!hint && !loading) return null;

  return (
    <div className="soft-card p-6 animate-fade-in relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      
      <div className="flex items-start gap-5 relative z-10">
        <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner-soft border border-accent/20">
          💡
        </div>
        <div className="flex-1 pt-1">
          <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">Refining Perspective</p>
          {loading && !hint ? (
            <div className="flex gap-2 py-2">
              <span className="w-2 h-2 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-accent/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <p className="text-luxury text-sm leading-relaxed font-semibold italic opacity-80">{hint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
