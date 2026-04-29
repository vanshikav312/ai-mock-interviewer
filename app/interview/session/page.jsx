'use client';
import { useState, useEffect, useRef } from 'react';
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
  const [questions, setQuestions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const allQAsRef = useRef([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingEval, setLoadingEval] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('answering');

  const { speaking, muted, supported: ttsSupported, speak, stop, toggleMute } = useTextToSpeech();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // Bulk fetch all questions on mount
  useEffect(() => {
    if (status === 'loading') return;

    async function fetchAllQuestions() {
      setLoadingQuestions(true);
      try {
        const res = await fetch('/api/interview/generate-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, difficulty, bulk: true, count: totalQuestions }),
        });
        if (!res.ok) throw new Error('Bulk fetch failed');
        const data = await res.json();
        if (!Array.isArray(data.questions) || data.questions.length === 0) throw new Error('No questions');
        setQuestions(data.questions);
      } catch (err) {
        console.warn('Bulk fetch failed, falling back to single question fetch…', err.message);
        try {
          const res = await fetch('/api/interview/generate-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, difficulty }),
          });
          const data = await res.json();
          setQuestions([data.question || 'Explain a challenging technical problem you solved.']);
        } catch {
          setQuestions(['Explain a challenging technical problem you solved and how you approached it.']);
        }
      } finally {
        setLoadingQuestions(false);
      }
    }

    fetchAllQuestions();
  }, [status, role, difficulty, totalQuestions]);

  const currentQuestion = questions[currentIndex] || '';

  // Auto-speak question when it changes
  useEffect(() => {
    if (currentQuestion && !loadingQuestions) {
      speak(currentQuestion);
    }
  }, [currentQuestion, loadingQuestions, speak]);

  const handleHint = async () => {
    setLoadingHint(true);
    setHint('');
    stop();
    try {
      const res = await fetch('/api/interview/hint-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, question: currentQuestion, partialAnswer: answer }),
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
        body: JSON.stringify({ role, question: currentQuestion, answer }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 503) throw new Error('overloaded');
        throw new Error(data.error || 'Failed');
      }
      const data = await res.json();
      setEvaluation(data);
      setPhase('scored');
      const qa = { question: currentQuestion, answer, ...data };
      const updated = [...allQAsRef.current, qa];
      allQAsRef.current = updated;
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
      // Store in sessionStorage to avoid HTTP 431 (URL too long)
      const dataToSave = allQAsRef.current;
      console.log('Saving to sessionStorage, QAs count:', dataToSave.length, dataToSave);
      sessionStorage.setItem('interviewQAs', JSON.stringify(dataToSave));
      // Verify it was saved
      const verify = sessionStorage.getItem('interviewQAs');
      console.log('Verified sessionStorage:', verify ? 'SET' : 'EMPTY');
      router.push(`/interview/report?role=${encodeURIComponent(role)}&difficulty=${encodeURIComponent(difficulty)}`);
      return;
    }

    // Pre-loaded question — instant transition, no API call
    if (questions[nextIndex]) {
      setCurrentIndex(nextIndex);
      setAnswer('');
      setHint('');
      setEvaluation(null);
      setError('');
      setPhase('answering');
      stop();
      return;
    }

    // Fallback: fetch next question individually
    setLoadingQuestions(true);
    fetch('/api/interview/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, difficulty }),
    })
      .then((r) => r.json())
      .then((data) => {
        setQuestions((prev) => {
          const updated = [...prev];
          updated[nextIndex] = data.question || 'Explain a challenging technical problem you solved.';
          return updated;
        });
      })
      .catch(() => {
        setQuestions((prev) => {
          const updated = [...prev];
          updated[nextIndex] = 'Explain a challenging technical problem you solved and how you approached it.';
          return updated;
        });
      })
      .finally(() => {
        setCurrentIndex(nextIndex);
        setAnswer('');
        setHint('');
        setEvaluation(null);
        setError('');
        setPhase('answering');
        stop();
        setLoadingQuestions(false);
      });
  };

  if (status === 'loading' || loadingQuestions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <div className="w-14 h-14 border-4 border-razor-accent/30 border-t-razor-accent rounded-full animate-spin shadow-[0_0_15px_rgba(20,141,141,0.5)]" />
        <p className="text-razor-accent font-bold tracking-wide animate-pulse">
          {loadingQuestions ? 'Preparing your interview questions...' : 'Loading session...'}
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
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          onReplay={() => speak(currentQuestion)}
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
