'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import QuestionCard from '@/components/interview/QuestionCard';
import AnswerInput from '@/components/interview/AnswerInput';
import ScoreCard from '@/components/interview/ScoreCard';
import HintBox from '@/components/interview/HintBox';
import { useTextToSpeech } from '@/hooks/useSpeech';

function SessionContent() {
  const { status } = useSession();
  const router = useRouter();
  const params = useSearchParams();

  const role = params.get('role') || 'Software Engineer';
  const difficulty = params.get('difficulty') || 'Medium';
  const totalQuestions = parseInt(params.get('count') || '5', 10);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [allQAs, setAllQAs] = useState([]);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [loadingEval, setLoadingEval] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('answering');

  // TTS hook
  const { speaking, muted, supported: ttsSupported, speak, stop, toggleMute } = useTextToSpeech();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchQuestion = useCallback(async (prevQs) => {
    setLoadingQuestion(true);
    setAnswer('');
    setHint('');
    setEvaluation(null);
    setError('');
    setPhase('answering');
    stop(); // stop any ongoing TTS when fetching new question
    try {
      const res = await fetch('/api/interview/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, difficulty, previousQuestions: prevQs }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (!data.question) throw new Error('No question');
      setQuestion(data.question);
    } catch {
      setQuestion('Explain a challenging technical problem you solved and how you approached it.');
    } finally {
      setLoadingQuestion(false);
    }
  }, [role, difficulty, stop]);

  // Auto-speak question when it loads
  useEffect(() => {
    if (question && !loadingQuestion) {
      speak(question);
    }
  }, [question, loadingQuestion, speak]);

  useEffect(() => { fetchQuestion([]); }, [fetchQuestion]);

  const handleHint = async () => {
    setLoadingHint(true);
    setHint('');
    stop();
    try {
      const res = await fetch('/api/interview/hint-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, question, partialAnswer: answer }),
      });
      if (!res.ok) throw new Error('Failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setHint(accumulated);
      }
    } catch {
      setHint('Think about the core concepts involved and how they apply to real-world scenarios.');
    } finally {
      setLoadingHint(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setLoadingEval(true);
    setError('');
    stop();
    try {
      const res = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, question, answer }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 503) {
          throw new Error('overloaded');
        }
        throw new Error(data.error || 'Failed');
      }
      const data = await res.json();
      setEvaluation(data);
      setPhase('scored');
      const qa = { question, answer, ...data };
      setAllQAs((prev) => [...prev, qa]);
      setPreviousQuestions((prev) => [...prev, question]);
    } catch (err) {
      if (err.message === 'overloaded') {
        setError('The AI service is temporarily busy. Your answer is saved — click Submit again in a moment.');
      } else {
        setError('Something went wrong evaluating your answer. Please try again.');
      }
    } finally {
      setLoadingEval(false);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      const encoded = encodeURIComponent(JSON.stringify([...allQAs]));
      router.push(`/interview/report?role=${encodeURIComponent(role)}&difficulty=${encodeURIComponent(difficulty)}&qas=${encoded}`);
    } else {
      setCurrentIndex(nextIndex);
      fetchQuestion(previousQuestions);
    }
  };

  if (status === 'loading' || loadingQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <div className="w-14 h-14 border-4 border-razor-accent/30 border-t-razor-accent rounded-full animate-spin shadow-[0_0_15px_rgba(20,141,141,0.5)]" />
        <p className="text-razor-accent font-bold tracking-wide animate-pulse">
          {loadingQuestion ? 'Generating your question...' : 'Loading session...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <nav className="border-b border-razor-teal bg-razor-navy/90 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>🤖</span> AI <span className="text-razor-accent">Interviewer</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="text-slate-300 text-sm font-bold hidden sm:block">{role}</span>
            <span className="bg-razor-teal/50 text-razor-green text-xs font-bold px-3 py-1.5 rounded-full border border-razor-accent/30 shadow-inner">
              {difficulty}
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <QuestionCard
          question={question}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          onReplay={() => speak(question)}
          speaking={speaking}
          muted={muted}
          onToggleMute={toggleMute}
          ttsSupported={ttsSupported}
        />

        {phase === 'answering' && (
          <>
            <HintBox hint={hint} loading={loadingHint} />
            <AnswerInput
              answer={answer}
              setAnswer={setAnswer}
              onSubmit={handleSubmit}
              onHint={handleHint}
              loading={loadingEval}
              hintLoading={loadingHint}
              error={error}
            />
          </>
        )}

        {phase === 'scored' && (
          <ScoreCard
            evaluation={evaluation}
            onNext={handleNext}
            isLast={currentIndex + 1 >= totalQuestions}
          />
        )}
      </main>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-razor-accent/30 border-t-razor-accent rounded-full animate-spin shadow-[0_0_15px_rgba(20,141,141,0.5)]" />
      </div>
    }>
      <SessionContent />
    </Suspense>
  );
}
