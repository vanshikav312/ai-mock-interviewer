'use client';
import { useCallback } from 'react';
import { useSpeechToText } from '@/hooks/useSpeech';

export default function AnswerInput({
  answer, setAnswer, onSubmit, onHint,
  loading, hintLoading, error,
}) {
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  
 const handleTranscript = useCallback((transcript) => {
  setAnswer(transcript);
}, [setAnswer]);
  const { listening, supported: sttSupported, toggleListening, stopListening } =
    useSpeechToText({ onTranscript: handleTranscript });

  // Stop mic when user submits
  const handleSubmit = () => {
    if (listening) stopListening();
    onSubmit();
  };

  return (
    <div className="glass-panel rounded-2xl p-7 mb-8 transition-all duration-300 hover:border-razor-accent/40 hover:shadow-razor-accent/5 group">

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <label className="text-slate-300 font-bold tracking-widest uppercase text-sm">
          Your Answer
        </label>
        <div className="flex items-center gap-3">
          {/* Listening badge */}
          {listening && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full animate-pulse">
              <span className="w-2 h-2 bg-red-400 rounded-full inline-block animate-ping" />
              Listening...
            </span>
          )}
          {/* Word count badge */}
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-inner ${
            wordCount < 20
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : wordCount < 60
              ? 'bg-razor-peach/20 text-razor-peach border border-razor-peach/30'
              : 'bg-razor-green/20 text-razor-green border border-razor-green/30'
          }`}>
            {wordCount} words
          </span>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={
          sttSupported
            ? 'Type your answer here, or click the 🎙 mic button to speak...'
            : 'Type your answer here... Be detailed and specific. Aim for at least 60 words.'
        }
        rows={7}
        className={`w-full bg-razor-navy/60 border text-white rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-razor-accent/50 focus:border-razor-accent placeholder-slate-500 resize-none text-sm leading-relaxed transition-all duration-300 shadow-inner font-medium ${
          listening
            ? 'border-red-400/60 ring-2 ring-red-400/20'
            : 'border-razor-teal/70'
        }`}
      />

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-inner">
          <span className="text-red-400 text-lg mt-0.5">⚠️</span>
          <div>
            <h4 className="text-red-400 font-bold text-sm tracking-wide">Submission Failed</h4>
            <p className="text-red-300 text-xs mt-1 leading-relaxed font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Button row */}
      <div className="flex gap-3 mt-6">

        {/* Mic button — only shown if browser supports STT */}
        {sttSupported && (
          <button
            onClick={toggleListening}
            disabled={loading}
            title={listening ? 'Stop recording' : 'Speak your answer'}
            className={`flex items-center justify-center w-14 h-14 rounded-xl border font-bold text-xl transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ${
              listening
                ? 'bg-red-500/30 border-red-400/60 text-red-300 shadow-red-500/20 animate-pulse'
                : 'bg-razor-teal/40 hover:bg-razor-teal/70 border-razor-accent/30 hover:border-red-400/50 text-slate-300 hover:text-red-300'
            }`}
          >
            {listening ? '⏹' : '🎙'}
          </button>
        )}

        {/* Hint button */}
        <button
          onClick={onHint}
          disabled={hintLoading || loading}
          className="flex items-center justify-center min-w-[130px] gap-2 px-5 py-3.5 bg-razor-teal/40 hover:bg-razor-teal/70 border border-razor-accent/30 hover:border-razor-peach/50 text-slate-300 hover:text-razor-peach rounded-xl text-sm font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm"
        >
          {hintLoading ? (
            <span className="animate-pulse tracking-wide">Getting hint...</span>
          ) : (
            <><span className="group-hover:scale-110 transition-transform">💡</span> Get Hint</>
          )}
        </button>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !answer.trim() || hintLoading}
          className="flex-1 bg-razor-peach hover:bg-razor-peach/90 disabled:opacity-50 disabled:cursor-not-allowed text-razor-navy font-black py-3.5 rounded-xl text-sm shadow-lg shadow-razor-peach/20 hover:shadow-razor-peach/40 transition-all duration-300 transform active:scale-[0.98] tracking-widest uppercase"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-razor-navy/30 border-t-razor-navy rounded-full animate-spin" />
              Evaluating...
            </span>
          ) : (
            'Submit Answer 🚀'
          )}
        </button>
      </div>

      {/* STT not supported notice */}
      {!sttSupported && (
        <p className="text-slate-500 text-xs mt-3 text-center">
          🎙 Voice input requires Chrome or Edge browser
        </p>
      )}
    </div>
  );
}
