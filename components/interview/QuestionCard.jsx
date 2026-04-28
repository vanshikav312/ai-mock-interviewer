'use client';

export default function QuestionCard({ question, questionNumber, totalQuestions }) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="glass-panel rounded-2xl p-7 mb-8 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <span className="text-sm text-slate-300 font-bold tracking-widest uppercase">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="text-sm text-razor-green font-bold bg-razor-green/10 px-4 py-1.5 rounded-full border border-razor-green/20 shadow-inner">
          {Math.round(progress)}% complete
        </span>
      </div>

      <div className="w-full bg-razor-navy/60 rounded-full h-3 mb-8 shadow-inner overflow-hidden border border-razor-teal/50">
        <div
          className="bg-razor-accent h-3 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(20,141,141,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-razor-navy/40 rounded-2xl p-7 border border-razor-teal shadow-inner backdrop-blur-sm">
        <p className="text-white text-xl leading-relaxed font-semibold animate-fade-in">{question}</p>
      </div>
    </div>
  );
}
