'use client';
import { useCallback, useState, useEffect } from 'react';
import { useSpeechToText } from '@/hooks/useSpeech';
import { useStreamingSpeech } from '@/hooks/useStreamingSpeech';

export default function AnswerInput({
  answer, setAnswer, onSubmit, onHint,
  loading, hintLoading, error,
  onPasteDetected, pasteWarning
}) {
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackWarning, setFallbackWarning] = useState(false);

  // 1. Streaming STT Hook (WebSocket -> Deepgram)
  const {
    listening: streamingListening,
    status: streamingStatus,
    error: streamingError,
    supported: streamingSupported,
    interimText: streamingInterimText,
    toggleListening: toggleStreaming,
    stopListening: stopStreaming
  } = useStreamingSpeech({
    onTranscript: useCallback((text, isFinal) => {
      // Only set final answers to avoid cursor jumping issues
      if (isFinal) {
        setAnswer(text);
      }
    }, [setAnswer])
  });

  // 2. Web Speech API STT Hook (Browser Fallback)
  const {
    listening: webSpeechListening,
    supported: webSpeechSupported,
    toggleListening: toggleWebSpeech,
    stopListening: stopWebSpeech
  } = useSpeechToText({
    onTranscript: useCallback((transcript) => {
      setAnswer(transcript);
    }, [setAnswer])
  });

  // Automatically fall back if streaming STT errors out
  useEffect(() => {
    if (streamingError && !useFallback) {
      console.warn('Streaming STT failed, falling back to browser Speech API:', streamingError);
      setUseFallback(true);
      setFallbackWarning(true);
      
      // If we were actively recording, stop streaming and run Web Speech
      if (streamingListening) {
        stopStreaming();
        toggleWebSpeech();
      }
    }
  }, [streamingError, streamingListening, useFallback, stopStreaming, toggleWebSpeech]);

  const listening = streamingListening || webSpeechListening;
  const sttSupported = (streamingSupported && !useFallback) || webSpeechSupported;

  const toggleListening = () => {
    if (useFallback || !streamingSupported) {
      toggleWebSpeech();
    } else {
      toggleStreaming();
    }
  };

  const stopListening = () => {
    if (useFallback || !streamingSupported) {
      stopWebSpeech();
    } else {
      stopStreaming();
    }
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  const handlePaste = (e) => {
    const pastedText = e.clipboardData?.getData('text') || '';
    const pastedWordCount = pastedText.trim().split(/\s+/).length;
    if (pastedWordCount >= 30) {
      onPasteDetected?.();
    }
  };

  const handleSubmit = () => {
    if (listening) stopListening();
    onSubmit();
  };

  return (
    <div className="soft-card p-6 sm:p-10 animate-slide-up">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <label className="text-[10px] font-black text-muted uppercase tracking-widest">
          Draft your response
        </label>
        <div className="flex items-center gap-3">
          {listening && (
            <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-pill shadow-inner-soft ${
              streamingStatus === 'connecting' ? 'text-yellow-600 bg-yellow-50' :
              webSpeechListening ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                streamingStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                webSpeechListening ? 'bg-orange-500 animate-ping' : 'bg-green-600 animate-ping'
              }`} />
              {streamingStatus === 'connecting' ? 'Connecting...' :
               webSpeechListening ? 'Browser Fallback' : 'Live Streaming STT'}
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
          onPaste={handlePaste}
          placeholder={sttSupported ? 'Type your thoughts or use the mic to speak naturally...' : 'Type your detailed answer here...'}
          rows={6}
          className={`w-full bg-soft rounded-3xl px-8 py-6 text-luxury placeholder-muted/40 resize-none font-medium leading-relaxed transition-all shadow-inner-soft border-2 outline-none ${
            streamingStatus === 'connecting' ? 'border-yellow-200 ring-4 ring-yellow-50' :
            streamingListening ? 'border-green-200 ring-4 ring-green-50' :
            webSpeechListening ? 'border-orange-200 ring-4 ring-orange-50' :
            'border-transparent focus:border-luxury/10 focus:bg-white focus:shadow-soft'
          }`}
        />
        {listening && (
          <div className={`absolute inset-0 rounded-3xl pointer-events-none animate-pulse ring-4 ${
            streamingStatus === 'connecting' ? 'ring-yellow-500/10' :
            webSpeechListening ? 'ring-orange-500/10' : 'ring-green-500/10'
          }`} />
        )}

        {/* Live Interim Transcript Bubble */}
        {streamingListening && streamingInterimText && (
          <div className="absolute bottom-4 left-8 right-8 text-xs font-semibold text-accent bg-white/95 backdrop-blur border border-accent/20 px-4 py-2.5 rounded-2xl shadow-soft pointer-events-none animate-pulse flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
            <span className="text-muted text-[10px] font-black uppercase tracking-wider">Hearing:</span>
            <span className="text-luxury italic">"{streamingInterimText}"</span>
          </div>
        )}
      </div>

      {fallbackWarning && (
        <p className="text-orange-600 text-[10px] font-bold mt-2 uppercase tracking-widest flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 animate-slide-up">
          ⚠️ STT server offline. Switched to native browser Web Speech API.
        </p>
      )}

      {pasteWarning && (
        <p className="text-razor-peach text-xs mt-2 flex items-center gap-1">
          📋 Large paste detected — original answers score higher
        </p>
      )}

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
              listening 
                ? (streamingStatus === 'connecting' ? 'bg-yellow-500 border-yellow-400 text-white animate-pulse' :
                   webSpeechListening ? 'bg-orange-500 border-orange-400 text-white animate-pulse' :
                   'bg-green-500 border-green-400 text-white animate-pulse scale-110')
                : 'bg-[#0F3D2E] border-white/10 text-white hover:bg-[#1F7A63]'
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

