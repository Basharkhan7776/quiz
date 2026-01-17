import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizListener } from '../hooks/useQuizListener';
import { BlurReveal } from '../components/BlurReveal';
import { AnimatePresence, motion } from 'framer-motion';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

const Play: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { session } = useQuizListener(quizId || '');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Reset local state when question changes
  useEffect(() => {
    // Only reset if we move to a new question index (not just status change)
    if (session?.status === 'waiting') {
      setHasSubmitted(false);
      setSelectedIdx(null);
    }
  }, [session?.currentQuestionIndex, session?.status]);

  const handleOptionClick = async (idx: number) => {
    if (hasSubmitted || !user || !quizId || !session) return;
    
    setSelectedIdx(idx);
    setHasSubmitted(true);

    const now = Date.now();
    // Calculate time taken (default to 30s if math fails)
    // @ts-ignore - session.startTime stored as number in my new hook update, but could be timestamp from old logic. 
    // Handling generic check:
    const start = session.startTime ? (typeof session.startTime === 'number' ? session.startTime : session.startTime.toMillis()) : now;
    const timeTaken = (now - start) / 1000;

    try {
      await addDoc(collection(db, 'responses'), {
        quizId,
        questionIndex: session.currentQuestionIndex,
        userId: user.uid,
        selectedOption: idx,
        submittedAt: serverTimestamp(),
        timeTaken: timeTaken
      });
    } catch (err) {
      console.error("Submission failed", err);
      setHasSubmitted(false);
    }
  };

  if (!session) return <div className="h-screen flex items-center justify-center">Loading Quiz Engine...</div>;
  
  if (session.status === 'finished') {
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <BlurReveal className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Quiz Finished</h1>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </BlurReveal>
      </div>
    );
  }

  // Determine option styling based on state
  const getOptionStyle = (idx: number) => {
    if (session.status === 'revealed' && session.correctIndex !== undefined) {
       if (idx === session.correctIndex) return 'bg-green-500 text-white border-green-600'; // Correct
       if (selectedIdx === idx && idx !== session.correctIndex) return 'bg-red-500 text-white border-red-600'; // User Wrong
       return 'opacity-50 border-zinc-200'; // Irrelevant
    }
    
    if (hasSubmitted) {
       return selectedIdx === idx 
        ? 'bg-black text-white border-black' 
        : 'opacity-50 border-zinc-200';
    }

    return 'bg-white text-black border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
      <BlurReveal className="w-full space-y-8">
        {/* Status Bar */}
        <div className="flex justify-between text-xs font-mono uppercase text-zinc-400 tracking-widest">
          <span>Q {session.currentQuestionIndex + 1}</span>
          <span>{session.status}</span>
        </div>

        {/* Question Area */}
        <div className="space-y-6">
           {session.currentImageUrl && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="w-full h-48 md:h-64 bg-zinc-100 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-200"
             >
               <img src={session.currentImageUrl} className="w-full h-full object-contain" alt="Question Ref" />
             </motion.div>
           )}

           <div className="min-h-[80px] flex items-center justify-center">
             <AnimatePresence mode="wait">
               <motion.h2 
                 key={session.currentQuestionText}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`text-2xl md:text-3xl font-bold text-center tracking-tight ${session.status === 'waiting' ? 'animate-pulse text-zinc-400' : 'text-black'}`}
               >
                 {session.currentQuestionText}
               </motion.h2>
             </AnimatePresence>
           </div>
        </div>

        {/* Options Grid */}
        <div className="grid gap-3">
          <AnimatePresence>
            {(session.status === 'active' || session.status === 'revealed') && session.currentOptions?.map((option, idx) => (
              <motion.button
                key={`${session.currentQuestionIndex}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleOptionClick(idx)}
                disabled={hasSubmitted || session.status === 'revealed'}
                className={`
                  p-5 text-left border rounded-xl transition-all duration-300
                  ${getOptionStyle(idx)}
                `}
              >
                <span className="mr-4 font-mono text-xs opacity-60">0{idx + 1}</span>
                {option}
              </motion.button>
            ))}
          </AnimatePresence>
          
          {session.status === 'waiting' && (
             <div className="flex justify-center py-12">
               <div className="flex gap-2">
                 <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-zinc-300 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
          )}
        </div>
      </BlurReveal>
    </div>
  );
};

export default Play;