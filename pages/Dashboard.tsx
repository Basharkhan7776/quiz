import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Quiz } from '../types';
import { BlurReveal } from '../components/BlurReveal';
import { Button } from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const { userData, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'quizzes'), where('status', '==', 'live'));
    const unsub = onSnapshot(q, (snapshot) => {
      const liveQuizzes = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Quiz));
      setQuizzes(liveQuizzes);
    });
    return () => unsub();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <BlurReveal>
        <header className="flex items-center justify-between border-b border-zinc-100 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-zinc-500 text-sm">Welcome back, {userData?.displayName}</p>
          </div>
          <div className="flex gap-2">
            {userData?.role === 'admin' && (
              <Button onClick={() => navigate('/admin/dashboard')} variant="outline">
                Admin Panel
              </Button>
            )}
            <Button onClick={logout} variant="outline">Logout</Button>
          </div>
        </header>
      </BlurReveal>

      <BlurReveal delay={0.1} className="space-y-6">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-400">Live Quizzes</h2>
        
        {quizzes.length === 0 ? (
          <div className="p-12 border border-dashed border-zinc-200 rounded-lg text-center text-zinc-400">
            No live quizzes at the moment.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <Link key={quiz.id} to={`/play/${quiz.id}`}>
                <div className="group block p-6 border border-zinc-200 rounded-xl hover:border-zinc-400 transition-all cursor-pointer">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium group-hover:underline">{quiz.title}</h3>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-500">Tap to join session</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </BlurReveal>
    </div>
  );
};

export default Dashboard;