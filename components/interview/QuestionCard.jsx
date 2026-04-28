'use client';

export default function QuestionCard({ question, questionNumber, totalQuestions }) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="glass-panel rounded-2xl p-6 mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400 font-medium tracking-wide">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="text-sm text-indigo-400 font-semibold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 shadow-inner">
          {Math.round(progress)}% complete
        </span>
      </div>

      <div className="w-full bg-slate-900/50 rounded-full h-2.5 mb-6 shadow-inner overflow-hidden border border-slate-700/50">
        <div
          className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 h-2.5 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(129,140,248,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-slate-900/40 rounded-xl p-6 border border-slate-700/50 shadow-inner backdrop-blur-sm">
        <p className="text-white text-lg leading-relaxed font-medium animate-fade-in">{question}</p>
      </div>
    </div>
  );
}
