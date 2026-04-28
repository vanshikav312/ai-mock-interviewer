'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import QuestionCard from '@/components/interview/QuestionCard';
import AnswerInput from '@/components/interview/AnswerInput';
import ScoreCard from '@/components/interview/ScoreCard';
import HintBox from '@/components/interview/HintBox';

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
  const [phase, setPhase] = useState('answering'); // 'answering' | 'scored'

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
    try {
      const res = await fetch('/api/interview/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, difficulty, previousQuestions: prevQs }),
      });
      if (!res.ok) throw new Error('Failed to fetch API');
      const data = await res.json();
      if (!data.question) throw new Error('No question returned');
      setQuestion(data.question);
    } catch {
      setQuestion('Explain a challenging technical problem you solved and how you approached it.');
    } finally {
      setLoadingQuestion(false);
    }
  }, [role, difficulty]);

  useEffect(() => {
    fetchQuestion([]);
  }, [fetchQuestion]);

  const handleHint = async () => {
    setLoadingHint(true);
    setHint('');
    try {
      const res = await fetch('/api/interview/hint-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, question, partialAnswer: answer }),
      });
      if (!res.ok) throw new Error('Failed to fetch API');
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
    try {
      const res = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, question, answer }),
      });
      if (!res.ok) throw new Error('Failed to fetch API');
      const data = await res.json();
      setEvaluation(data);
      setPhase('scored');
      const qa = { question, answer, ...data };
      setAllQAs((prev) => [...prev, qa]);
      setPreviousQuestions((prev) => [...prev, question]);
    } catch (err) {
      console.error(err);
      setError('The AI service is temporarily unavailable (503). Please try submitting again in a few seconds.');
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 animate-pulse">
          {loadingQuestion ? 'Generating your question...' : 'Loading...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-black text-white">
            AI <span className="text-purple-400">Interviewer</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">{role}</span>
            <span className="bg-slate-700 text-slate-300 text-xs font-semibold px-2 py-1 rounded-full">
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SessionContent />
    </Suspense>
  );
}
