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
      const dataToSave = allQAsRef.current;
      sessionStorage.setItem('interviewQAs', JSON.stringify(dataToSave));
      router.push(`/interview/report?role=${encodeURIComponent(role)}&difficulty=${encodeURIComponent(difficulty)}`);
      return;
    }

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
      <div className="min-h-screen bg-soft flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-luxury/10 border-t-luxury rounded-full animate-spin shadow-soft" />
        <div className="text-center space-y-2">
          <p className="text-luxury font-black tracking-widest text-xs uppercase animate-pulse">
            {loadingQuestions ? 'Building your scenario...' : 'Entering space...'}
          </p>
          <p className="text-muted text-sm font-medium italic opacity-60">"Preparing a deep technical experience for you."</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft selection:bg-luxury/10">
      {/* Floating Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl">
        <div className="glass-panel px-8 py-4 rounded-pill flex items-center justify-between shadow-soft border border-depth/20">
          <div className="flex items-center gap-6">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
            <div className="hidden md:block h-8 w-px bg-depth/30" />
            <div className="hidden md:flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">Role Path</span>
              <span className="text-sm font-bold text-luxury">{role}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-luxury/5 border border-depth/30 px-4 py-1.5 rounded-pill shadow-inner-soft">
              <span className="text-[10px] font-black text-luxury tracking-widest">{currentIndex + 1} of {totalQuestions}</span>
            </div>
            <button onClick={() => router.push('/dashboard')} className="text-muted hover:text-luxury text-[10px] font-black uppercase tracking-widest px-2 transition-colors">
              Quit
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="animate-slide-up">
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
        </div>

        {phase === 'answering' && (
          <div className="mt-8 space-y-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
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
          </div>
        )}

        {phase === 'scored' && (
          <div className="mt-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <ScoreCard
              evaluation={evaluation}
              onNext={handleNext}
              isLast={currentIndex + 1 >= totalQuestions}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-soft flex items-center justify-center">
        <div className="w-14 h-14 border-4 border-luxury/20 border-t-luxury rounded-full animate-spin shadow-soft" />
      </div>
    }>
      <SessionContent />
    </Suspense>
  );
}
