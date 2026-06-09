'use client';
import { useState } from 'react';
import { useStreamingSpeech } from '@/hooks/useStreamingSpeech';

export default function TestSpeechPage() {
  const [transcript, setTranscript] = useState('');

  const { listening, status, error, supported, toggleListening } = useStreamingSpeech({
    onTranscript: (text, isFinal) => {
      console.log(`[TestSpeech] [${isFinal ? 'FINAL' : 'INTERIM'}]:`, text);
      setTranscript(text);
    }
  });

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-slate-800 p-8 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-700">
        <h1 className="text-2xl font-bold mb-4 tracking-tight">🎙️ Real-time STT Tester (Phase 2)</h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Open your browser developer console (press F12 and select the Console tab) to inspect the transcripts streaming in real-time as you speak.
        </p>

        {/* Status Indicators */}
        <div className="bg-slate-950 p-5 rounded-2xl mb-8 flex flex-col items-center justify-center border border-slate-900">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">
            Pipeline Connection Status
          </span>
          <div className="flex items-center gap-2 mt-1">
            {listening && <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />}
            <span className={`text-lg font-black capitalize tracking-wide ${
              status === 'recording' ? 'text-green-400' :
              status === 'connecting' ? 'text-yellow-400' :
              status === 'error' ? 'text-red-400' : 'text-slate-400'
            }`}>
              {status}
            </span>
          </div>
          {error && (
            <p className="text-xs text-red-400 mt-3 bg-red-950/40 border border-red-900/30 px-3 py-1.5 rounded-lg">
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={toggleListening}
          className={`px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all shadow-md active:scale-95 ${
            listening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-[#0F3D2E] hover:bg-[#1F7A63] text-white'
          }`}
        >
          {listening ? '⏹️ Stop Recording' : '🎙️ Start Recording'}
        </button>

        {/* Live Transcript Display */}
        <div className="mt-8 text-left">
          <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-2">
            Live Transcript Output
          </label>
          <div className="bg-slate-950 p-6 rounded-2xl min-h-[140px] border border-slate-900 font-medium leading-relaxed text-slate-200 text-sm whitespace-pre-wrap select-all">
            {transcript || <span className="text-slate-600 italic">No speech detected yet. Click "Start Recording" and speak.</span>}
          </div>
        </div>

        {/* Fallback Check */}
        {!supported && (
          <p className="text-xs text-red-400 mt-4 font-semibold uppercase tracking-wider">
            ⚠️ MediaDevices or MediaRecorder are not supported in this browser.
          </p>
        )}
      </div>
    </div>
  );
}
