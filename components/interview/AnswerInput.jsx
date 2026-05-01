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

  const handleSubmit = () => {
    if (listening) stopListening();
    onSubmit();
  };

  return (
    <div className="soft-card p-10 animate-slide-up">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <label className="text-[10px] font-black text-muted uppercase tracking-widest">
          Draft your response
        </label>
        <div className="flex items-center gap-3">
          {listening && (
            <span className="flex items-center gap-2 text-[10px] text-red-600 font-black uppercase tracking-widest bg-red-50 px-4 py-2 rounded-pill shadow-inner-soft">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
              Recording
            </span>
          )}
          <span className={`text-[10px] font-black px-4 py-2 rounded-pill shadow-inner-soft uppercase tracking-widest ${
            wordCount < 20 ? 'text-red-600 bg-red-50' : wordCount < 60 ? 'text-accent bg-accent/5' : 'text-luxury bg-soft'
          }`}>
            {wordCount} words
          </span>
        </div>
      </div>

      {/* Textarea */}
      <div className="relative group">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={sttSupported ? 'Type your thoughts or use the mic to speak naturally...' : 'Type your detailed answer here...'}
          rows={6}
          className={`w-full bg-soft rounded-3xl px-8 py-6 text-luxury placeholder-muted/40 resize-none font-medium leading-relaxed transition-all shadow-inner-soft border-2 outline-none ${
            listening ? 'border-red-200 ring-4 ring-red-50' : 'border-transparent focus:border-luxury/10 focus:bg-white focus:shadow-soft'
          }`}
        />
        {listening && <div className="absolute inset-0 rounded-3xl pointer-events-none animate-pulse ring-4 ring-red-500/10" />}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-6 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 animate-slide-up">
          <span className="text-xl opacity-20">•</span>
          <p className="text-red-700 text-xs font-bold leading-relaxed">{error}</p>
        </div>
      )}

      {/* Button row */}
      <div className="flex flex-wrap gap-4 mt-8">
        {sttSupported && (
          <button
            onClick={toggleListening}
            disabled={loading}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-soft border-2 ${
              listening ? 'bg-red-500 border-red-400 text-white animate-pulse scale-110' : 'bg-[#0F3D2E] border-white/10 text-white hover:bg-[#1F7A63]'
            }`}
          >
            {listening ? '⏹' : '🎙'}
          </button>
        )}

        <button
          onClick={onHint}
          disabled={hintLoading || loading}
          className="pill-btn flex-1 min-w-[160px] bg-white border-2 border-depth/30 text-luxury hover:bg-soft shadow-soft flex items-center justify-center gap-2 text-sm font-black tracking-widest uppercase disabled:opacity-50"
        >
          {hintLoading ? 'Tuning hints...' : <><span className="text-lg">💡</span> Get Hint</>}
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading || !answer.trim() || hintLoading}
          className="pill-btn flex-[2] min-w-[200px] bg-accent text-white py-5 shadow-soft hover:shadow-elevated hover:-translate-y-1 text-sm font-black tracking-widest uppercase disabled:opacity-50 transition-all flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : 'Submit Answer'}
        </button>
      </div>

      {!sttSupported && <p className="text-muted text-[10px] font-bold mt-4 text-center opacity-40 uppercase tracking-widest">Voice input available on Chrome & Edge</p>}
    </div>
  );
}
