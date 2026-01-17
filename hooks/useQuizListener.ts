import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { LiveSession } from '../types';

export const useQuizListener = (quizId: string) => {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;

    const unsub = onSnapshot(doc(db, 'live_sessions', quizId), (docSnap) => {
      if (docSnap.exists()) {
        setSession(docSnap.data() as LiveSession);
      } else {
        setSession(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [quizId]);

  return { session, loading };
};