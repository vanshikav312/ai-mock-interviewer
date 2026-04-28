'use client';

export default function QuestionCard({ question, questionNumber, totalQuestions }) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400 font-medium">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="text-sm text-purple-400 font-semibold">
          {Math.round(progress)}% complete
        </span>
      </div>

      <div className="w-full bg-slate-700 rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-slate-700/40 rounded-xl p-5">
        <p className="text-white text-lg leading-relaxed font-medium">{question}</p>
      </div>
    </div>
  );
}
