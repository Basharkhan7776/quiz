import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Response as QuizResponse, UserData, Question } from '../types';
import { motion } from 'framer-motion';

interface LeaderboardProps {
  quizId: string;
  questions: Question[]; // Needed to check correct answers
}

interface UserScore {
  userId: string;
  displayName: string;
  totalScore: number;
  totalTime: number; // For tie breaking
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ quizId, questions }) => {
  const [scores, setScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // 1. Fetch all responses for this quiz
        const respQuery = query(collection(db, 'responses'), where('quizId', '==', quizId));
        const respSnap = await getDocs(respQuery);
        const responses = respSnap.docs.map(d => d.data() as QuizResponse);

        // 2. Fetch all users involved (optimization: cache this in real app)
        const uniqueUserIds = [...new Set(responses.map(r => r.userId))];
        const userMap: Record<string, string> = {};
        
        await Promise.all(uniqueUserIds.map(async (uid: string) => {
          const uSnap = await getDoc(doc(db, 'users', uid));
          const userData = uSnap.data() as UserData | undefined;
          
          if (uSnap.exists() && userData) {
            userMap[uid] = userData.displayName || 'Anonymous';
          } else {
            userMap[uid] = 'Unknown';
          }
        }));

        // 3. Calculate Scores
        const calculatedScores: Record<string, UserScore> = {};

        responses.forEach(resp => {
            const question = questions[resp.questionIndex];
            if (!question) return;

            const isCorrect = resp.selectedOption === question.correctIndex;
            
            // Score Algorithm: 
            // Correct Base: 1000
            // Speed Bonus: Up to 500 based on time taken vs limit.
            // If incorrect: 0
            
            let points = 0;
            if (isCorrect) {
              const bonus = Math.max(0, (1 - (resp.timeTaken / question.timeLimit)) * 500);
              points = 1000 + Math.floor(bonus);
            }

            if (!calculatedScores[resp.userId]) {
              calculatedScores[resp.userId] = {
                userId: resp.userId,
                displayName: userMap[resp.userId] || 'Unknown',
                totalScore: 0,
                totalTime: 0
              };
            }

            calculatedScores[resp.userId].totalScore += points;
            calculatedScores[resp.userId].totalTime += resp.timeTaken;
        });

        // 4. Convert to array and sort
        const sorted = Object.values(calculatedScores).sort((a, b) => {
          if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
          return a.totalTime - b.totalTime; // Lower time wins tie
        });

        setScores(sorted);
        setLoading(false);
      } catch (err) {
        console.error("Error calculating leaderboard", err);
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [quizId, questions]);

  if (loading) return <div className="text-center p-4 text-xs animate-pulse">Calculating Protocols...</div>;

  return (
    <div className="w-full bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-black text-white p-3 text-sm font-bold tracking-wider uppercase text-center">
        Live Ranking
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 bg-zinc-50 uppercase sticky top-0">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Agent</th>
              <th className="px-4 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {scores.map((s, idx) => (
              <motion.tr 
                key={s.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={idx === 0 ? "bg-yellow-50/50 font-semibold" : ""}
              >
                <td className="px-4 py-3 text-zinc-400 font-mono">{String(idx + 1).padStart(2, '0')}</td>
                <td className="px-4 py-3">{s.displayName}</td>
                <td className="px-4 py-3 text-right font-mono">{s.totalScore.toLocaleString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {scores.length === 0 && (
          <div className="p-8 text-center text-zinc-400 text-xs">No data available</div>
        )}
      </div>
    </div>
  );
};