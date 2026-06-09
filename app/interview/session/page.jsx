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
  const jd = params.get('jd') ? decodeURIComponent(params.get('jd')) : '';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  
  const [sessionId, setSessionId] = useState(null);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [nextTurnInfo, setNextTurnInfo] = useState(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const allQAsRef = useRef([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingEval, setLoadingEval] = useState(false);
  const [loadingHint, setLoadingHint] = useState(false);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('answering');

  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [sessionFlagged, setSessionFlagged] = useState(false);
  const [pasteDetected, setPasteDetected] = useState(false);
  const [pasteWarning, setPasteWarning] = useState(false);

  const { speaking, muted, supported: ttsSupported, speak, stop, toggleMute } = useTextToSpeech();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (tabSwitchCount > 2) {
      router.push('/interview/setup?error=tab_switch');
    }
  }, [tabSwitchCount, router]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && phase === 'answering') {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1;
          setShowTabWarning(true);
          setTimeout(() => setShowTabWarning(false), 4000);
          if (newCount >= 3) setSessionFlagged(true);
          return newCount;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [phase]);

  useEffect(() => {
    if (status === 'loading') return;

    async function startRagSession() {
      setLoadingQuestions(true);
      try {
        const payload = {
          action: 'start',
          role,
          difficulty,
          num_questions: totalQuestions,
          jd_text: jd || `General ${role} interview`
        };

        const res = await fetch('/api/interview/rag-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) throw new Error('Start session failed');
        
        const data = await res.json();
        setSessionId(data.session_id);
        setQuestions([data.question]);
        setCurrentIndex(0);
        setIsFollowUp(data.is_follow_up);
        setIsFallbackMode(false);
        setLoadingQuestions(false);
      } catch (err) {
        console.warn('Python RAG API failed, falling back to local flow...', err);
        setIsFallbackMode(true);
        // Fallback: fetch original questions
        try {
          const res = await fetch('/api/interview/generate-question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, difficulty, bulk: true, count: totalQuestions, jobDescription: jd }),
          });
          if (!res.ok) throw new Error('Bulk fetch failed');
          const data = await res.json();
          if (!Array.isArray(data.questions) || data.questions.length === 0) throw new Error('No questions');
          setQuestions(data.questions);
        } catch (fallbackErr) {
          console.warn('Bulk fetch fallback failed, falling back to single...', fallbackErr.message);
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
    }

    startRagSession();
  }, [status, role, difficulty, totalQuestions, jd]);

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

    if (isFallbackMode) {
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
        const qa = { question: currentQuestion, answer, ...data, pasteDetected };
        allQAsRef.current = [...allQAsRef.current, qa];
      } catch (err) {
        if (err.message === 'overloaded') {
          setError('The AI service is temporarily busy. Your answer is saved — click Submit again in a moment.');
        } else {
          setError('Something went wrong evaluating your answer. Please try again.');
        }
      } finally {
        setLoadingEval(false);
      }
      return;
    }

    try {
      const res = await fetch('/api/interview/rag-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'answer', session_id: sessionId, answer }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 503) throw new Error('overloaded');
        throw new Error(data.error || 'Failed');
      }
      
      const data = await res.json();
      const evalData = data.last_evaluation || {};
      
      const overallScore = evalData.scores?.overall || 0;
      let calculatedVerdict = 'Needs Work';
      if (overallScore >= 85) calculatedVerdict = 'Excellent';
      else if (overallScore >= 70) calculatedVerdict = 'Good';
      else if (overallScore >= 50) calculatedVerdict = 'Average';

      const formattedEval = {
        score: overallScore,
        clarity: evalData.scores?.clarity || 0,
        technical: evalData.scores?.technical || 0,
        relevance: evalData.scores?.relevance || 0,
        feedback: evalData.feedback || '',
        strengths: evalData.strengths || [],
        improvements: evalData.improvements || [],
        grounded: evalData.grounded,
        reference_topic: evalData.reference_topic,
        is_follow_up: evalData.is_follow_up,
        verdict: evalData.verdict || calculatedVerdict,
      };

      setEvaluation(formattedEval);
      setPhase('scored');
      
      // Save a flat QA to the ref — final-report route expects strings, not arrays
      const qa = {
        question: currentQuestion,
        answer,
        score: formattedEval.score,
        clarity: formattedEval.clarity,
        technical: formattedEval.technical,
        relevance: formattedEval.relevance,
        verdict: formattedEval.verdict,
        strengths: Array.isArray(formattedEval.strengths)
          ? formattedEval.strengths.join('. ')
          : (formattedEval.strengths || ''),
        improvements: Array.isArray(formattedEval.improvements)
          ? formattedEval.improvements.join('. ')
          : (formattedEval.improvements || ''),
        idealAnswer: '',
        pasteDetected,
      };
      allQAsRef.current = [...allQAsRef.current, qa];
      
      setNextTurnInfo({
        status: data.status,
        question: data.question,
        isFollowUp: data.is_follow_up,
        questionNumber: data.question_number, // 1-based, main questions only (from Python)
      });

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
    if (isFallbackMode) {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= totalQuestions) {
        const dataToSave = allQAsRef.current;
        sessionStorage.setItem('interviewQAs', JSON.stringify(dataToSave));
        sessionStorage.setItem('tabSwitches', tabSwitchCount.toString());
        sessionStorage.setItem('sessionFlagged', sessionFlagged.toString());
        sessionStorage.setItem('pasteDetected', pasteDetected.toString());
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
        setPasteWarning(false);
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
          setPasteWarning(false);
          stop();
          setLoadingQuestions(false);
        });
      return;
    }

    if (nextTurnInfo?.status === 'complete') {
      const dataToSave = allQAsRef.current;
      sessionStorage.setItem('interviewQAs', JSON.stringify(dataToSave));
      sessionStorage.setItem('tabSwitches', tabSwitchCount.toString());
      sessionStorage.setItem('sessionFlagged', sessionFlagged.toString());
      sessionStorage.setItem('pasteDetected', pasteDetected.toString());
      router.push(`/interview/report?role=${encodeURIComponent(role)}&difficulty=${encodeURIComponent(difficulty)}`);
      return;
    }

    if (nextTurnInfo?.question) {
      if (nextTurnInfo.isFollowUp) {
        // Follow-up: replace the current question slot, index stays the same
        setQuestions((prev) => {
          const updated = [...prev];
          updated[currentIndex] = nextTurnInfo.question;
          return updated;
        });
        // currentIndex stays unchanged — follow-ups don't advance progress
      } else {
        // Main question: use the backend's authoritative question_number (1-based)
        // This prevents any drift from follow-up counting
        const nextIdx = nextTurnInfo.questionNumber != null
          ? nextTurnInfo.questionNumber - 1  // backend says this is main question N
          : currentIndex + 1;                 // fallback if questionNumber missing

        // Hard cap: never exceed what the user selected
        if (nextIdx >= totalQuestions) {
          // Backend sent an extra question somehow — just complete the session
          const dataToSave = allQAsRef.current;
          sessionStorage.setItem('interviewQAs', JSON.stringify(dataToSave));
          sessionStorage.setItem('tabSwitches', tabSwitchCount.toString());
          sessionStorage.setItem('sessionFlagged', sessionFlagged.toString());
          sessionStorage.setItem('pasteDetected', pasteDetected.toString());
          router.push(`/interview/report?role=${encodeURIComponent(role)}&difficulty=${encodeURIComponent(difficulty)}`);
          return;
        }

        setQuestions((prev) => {
          const updated = [...prev];
          updated[nextIdx] = nextTurnInfo.question;
          return updated;
        });
        setCurrentIndex(nextIdx);
      }
      setIsFollowUp(nextTurnInfo.isFollowUp);
      
      setAnswer('');
      setHint('');
      setEvaluation(null);
      setError('');
      setPhase('answering');
      setPasteWarning(false);
      setNextTurnInfo(null);
      stop();
    }
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
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
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

      {showTabWarning && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 
                        animate-fade-in">
          <div className="bg-razor-peach/20 border border-razor-peach/60 
                          text-razor-peach px-6 py-3 rounded-xl 
                          backdrop-blur shadow-lg text-sm font-bold 
                          flex items-center gap-2">
            ⚠️ Tab switch detected ({tabSwitchCount}/3)
            {tabSwitchCount < 3 
              ? ' — Stay focused!' 
              : ' — Session flagged'}
          </div>
        </div>
      )}

      {sessionFlagged && (
        <div className="bg-red-500/10 border-b border-red-500/30 
                        text-red-400 text-center text-sm py-2 font-bold">
          🚨 This session has been flagged for integrity violations
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-20">
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
            isFollowUp={isFollowUp}
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
              onPasteDetected={() => {
                setPasteDetected(true);
                setPasteWarning(true);
              }}
              pasteWarning={pasteWarning}
            />
          </div>
        )}

        {phase === 'scored' && (
          <div className="mt-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <ScoreCard
              evaluation={evaluation}
              onNext={handleNext}
              isLast={isFallbackMode ? (currentIndex + 1 >= totalQuestions) : (nextTurnInfo?.status === 'complete')}
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
