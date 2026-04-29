'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

// ── Speech-to-Text hook ──────────────────────────────────────────────────────
export function useSpeechToText({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript); // FIX 1: stable ref, no re-renders
  const finalTranscriptRef = useRef('');        // FIX 2: accumulate only finals

  // Keep ref in sync without recreating recognition
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    setSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += chunk + ' '; // FIX 2: only append finals
        } else {
          interimTranscript = chunk; // FIX 3: interim is just the latest, no appending
        }
      }

      // Show final + current interim — clean, no repetition
      onTranscriptRef.current(
        (finalTranscriptRef.current + interimTranscript).trim()
      );
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
  }, []); // FIX 1: runs once only, no dependency on onTranscript

  const startListening = useCallback(() => {
    if (recognitionRef.current && !listening) {
      finalTranscriptRef.current = ''; // reset on each new session
      recognitionRef.current.start();
      setListening(true);
    }
  }, [listening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
      setListening(false);
    }
  }, [listening]);

  const toggleListening = useCallback(() => {
    listening ? stopListening() : startListening();
  }, [listening, startListening, stopListening]);

  return { listening, supported, toggleListening, stopListening };
}

// ── Text-to-Speech hook ──────────────────────────────────────────────────────
export function useTextToSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSupported(true);
    }
  }, []);

  const speak = useCallback((text) => {
    if (!supported || muted || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.lang === 'en-US' && v.name.toLowerCase().includes('natural')
    ) || voices.find((v) => v.lang === 'en-US') || voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [supported, muted]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!muted) window.speechSynthesis.cancel();
    setMuted((m) => !m);
  }, [muted]);

  return { speaking, muted, supported, speak, stop, toggleMute };
}