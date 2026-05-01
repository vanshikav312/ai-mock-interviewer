'use client';

export default function QuestionCard({
  question, questionNumber, totalQuestions,
  onReplay, speaking, muted, onToggleMute, ttsSupported,
}) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="soft-card-elevated p-10 animate-slide-up relative overflow-hidden group">
      {/* Decorative side accent */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-luxury opacity-10 group-hover:opacity-100 transition-opacity" />

      {/* Top row: progress label + mute toggle */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-luxury flex items-center justify-center text-white font-black text-xs shadow-soft">
            {questionNumber}
          </div>
          <span className="text-[10px] font-black text-muted uppercase tracking-widest">
            Question of {totalQuestions}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {speaking && (
            <span className="flex items-center gap-2 text-[10px] text-luxury font-black uppercase tracking-widest bg-soft px-4 py-2 rounded-pill shadow-inner-soft">
              <span className="w-1.5 h-1.5 bg-luxury rounded-full animate-ping" />
              Speaking
            </span>
          )}
          {ttsSupported && (
            <button
              onClick={onToggleMute}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-soft border ${
                muted
                  ? 'bg-red-50 border-red-100 text-white'
                  : 'bg-white border-depth/30 text-luxury hover:bg-soft'
              }`}
            >
              {muted ? 'Muted' : 'Sound'}
            </button>
          )}
        </div>
      </div>

      {/* Question text */}
      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-black text-luxury leading-tight tracking-tighter">
          {question}
        </h2>
      </div>

      {/* Bottom row: Progress & Replay */}
      <div className="flex flex-col sm:flex-row items-center gap-8 pt-8 border-t border-depth/30">
        <div className="flex-1 w-full space-y-2">
          <div className="flex justify-between text-[10px] font-black text-muted uppercase tracking-widest">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-soft rounded-full overflow-hidden shadow-inner-soft">
            <div
              className="bg-luxury h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {ttsSupported && onReplay && (
          <button
            onClick={onReplay}
            disabled={speaking}
            className="flex-shrink-0 pill-btn bg-soft text-luxury px-6 py-3 text-[10px] uppercase font-black tracking-widest border border-depth/30 hover:bg-depth/20 disabled:opacity-40"
          >
            {speaking ? 'Reading...' : 'Replay'}
          </button>
        )}
      </div>
    </div>
  );
}
