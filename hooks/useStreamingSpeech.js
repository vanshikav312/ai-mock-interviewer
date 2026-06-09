'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

export function useStreamingSpeech({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'connecting' | 'recording' | 'error'
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(false);
  const [interimText, setInterimText] = useState('');

  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  const accumulatedTranscriptRef = useRef('');

  // Keep callback reference updated without triggering re-effects
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // Check browser support for MediaDevices & MediaRecorder
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices && window.MediaRecorder) {
      setSupported(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    // 1. Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error('Error stopping MediaRecorder:', err);
      }
    }

    // 2. Send stop control message & close WebSocket
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify({ type: 'stop' }));
        } catch (err) {
          console.error('Error sending stop signal to socket:', err);
        }
      }
      socketRef.current.close();
      socketRef.current = null;
    }

    // 3. Stop microphone audio tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setListening(false);
    setInterimText('');
    if (status !== 'error') {
      setStatus('idle');
    }
  }, [status]);

  const startListening = useCallback(async () => {
    if (!supported) {
      setError('Audio streaming is not supported on this browser.');
      setStatus('error');
      return;
    }

    try {
      // Reset state
      setError(null);
      setStatus('connecting');
      setInterimText('');
      accumulatedTranscriptRef.current = '';

      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 2. Connect to WebSocket server (reads from env, falls back to localhost)
      const wsServerUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
      const socket = new WebSocket(wsServerUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('[useStreamingSpeech] Socket connected, waiting for backend signal...');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connected') {
            console.log('[useStreamingSpeech] Backend STT bridge active, starting recording.');
            setListening(true);
            setStatus('recording');

            // 3. Setup MediaRecorder
            let options = {};
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
              options = { mimeType: 'audio/webm;codecs=opus' };
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
              options = { mimeType: 'audio/webm' };
            } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
              options = { mimeType: 'audio/ogg;codecs=opus' };
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
              options = { mimeType: 'audio/mp4' };
            }

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
                // Stream binary audio chunk to server
                socket.send(e.data);
              }
            };

            // Capture and stream every 250ms
            mediaRecorder.start(250);
          }

          if (data.type === 'interim' || data.type === 'final') {
            const currentTranscript = data.text || '';
            
            if (data.type === 'final') {
              // Append to stable accumulated text and clear interim
              accumulatedTranscriptRef.current += currentTranscript + ' ';
              setInterimText('');
            } else {
              // Set the active interim text
              setInterimText(currentTranscript);
            }

            // Combine stable finals + current live interim
            const fullTranscript = data.type === 'final'
              ? accumulatedTranscriptRef.current.trim()
              : (accumulatedTranscriptRef.current + currentTranscript).trim();

            console.log(`[useStreamingSpeech] [${data.type.toUpperCase()}] :`, fullTranscript);
            
            if (onTranscriptRef.current) {
              onTranscriptRef.current(fullTranscript, data.type === 'final');
            }
          }

          if (data.type === 'error') {
            console.error('[useStreamingSpeech] Server Error:', data.message);
            setError(data.message);
            setStatus('error');
            stopListening();
          }
        } catch (err) {
          console.error('[useStreamingSpeech] Error parsing socket data:', err);
        }
      };

      socket.onerror = (err) => {
        console.error('[useStreamingSpeech] Socket error:', err);
        setError('Connection to recording server failed.');
        setStatus('error');
        stopListening();
      };

      socket.onclose = () => {
        console.log('[useStreamingSpeech] Socket connection closed.');
      };

    } catch (err) {
      console.error('[useStreamingSpeech] Permission or setup error:', err);
      setError(err.name === 'NotAllowedError' ? 'Microphone permission denied.' : 'Failed to initialize audio recording.');
      setStatus('error');
      stopListening();
    }
  }, [supported, stopListening]);

  const toggleListening = useCallback(() => {
    listening ? stopListening() : startListening();
  }, [listening, startListening, stopListening]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (socketRef.current || mediaRecorderRef.current || streamRef.current) {
        // Stop silently
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          try { mediaRecorderRef.current.stop(); } catch (e) {}
        }
        if (socketRef.current) {
          try { socketRef.current.close(); } catch (e) {}
        }
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
        }
      }
    };
  }, []);

  return {
    listening,
    status,
    error,
    supported,
    interimText,
    toggleListening,
    stopListening
  };
}
