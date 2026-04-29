'use client';

export default function QuestionCard({
  question, questionNumber, totalQuestions,
  onReplay, speaking, muted, onToggleMute, ttsSupported,
}) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="glass-panel rounded-2xl p-7 mb-8 animate-slide-up">

      {/* Top row: progress label + mute toggle */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm text-slate-300 font-bold tracking-widest uppercase">
          Question {questionNumber} of {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          {/* Speaking indicator */}
          {speaking && (
            <span className="flex items-center gap-1.5 text-xs text-razor-accent font-bold bg-razor-accent/10 border border-razor-accent/30 px-3 py-1 rounded-full animate-pulse">
              <span className="w-2 h-2 bg-razor-accent rounded-full animate-ping inline-block" />
              Speaking...
            </span>
          )}
          {/* Mute toggle */}
          {ttsSupported && (
            <button
              onClick={onToggleMute}
              title={muted ? 'Unmute AI voice' : 'Mute AI voice'}
              className={`text-lg px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                muted
                  ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                  : 'bg-razor-teal/40 border-razor-accent/30 text-razor-accent hover:bg-razor-teal/70'
              }`}
            >
              {muted ? '🔇' : '🔊'}
            </button>
          )}
          {/* Completion badge */}
          <span className="text-sm text-razor-green font-bold bg-razor-green/10 px-4 py-1.5 rounded-full border border-razor-green/20 shadow-inner">
            {Math.round(progress)}% complete
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-razor-navy/60 rounded-full h-3 mb-8 shadow-inner overflow-hidden border border-razor-teal/50">
        <div
          className="bg-razor-accent h-3 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(20,141,141,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question text */}
      <div className="bg-razor-navy/40 rounded-2xl p-7 border border-razor-teal shadow-inner backdrop-blur-sm">
        <p className="text-white text-xl leading-relaxed font-semibold animate-fade-in">
          {question}
        </p>
      </div>

      {/* Replay button */}
      {ttsSupported && onReplay && (
        <button
          onClick={onReplay}
          disabled={speaking}
          className="mt-4 flex items-center gap-2 text-sm text-razor-accent hover:text-white font-bold transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-base">{speaking ? '🔉' : '🔁'}</span>
          {speaking ? 'Reading question...' : 'Replay question'}
        </button>
      )}
    </div>
  );
}
