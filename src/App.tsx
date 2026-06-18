/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect, useRef } from 'react';
import KithumiView from './components/KithumiView';
import SudilaView from './components/SudilaView';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ILOVEYOUS = [
  "I love you", "Je t'aime", "Te amo", "Ich liebe dich", "Ti amo",
  "Eu te amo", "Aishiteru", "Saranghae", "Wo ai ni", "Ya tebya lyublyu",
  "Ik hou van jou", "S'agapo", "Mahal kita", "Mama oyata adarei", 
  "Naan unnai kadhalikkiren", "Seni seviyorum", "Jag älskar dig"
];

function generateExplosions() {
  return ILOVEYOUS.map((text, i) => {
    const angle = (Math.random() * Math.PI * 2);
    const distance = 80 + Math.random() * 200;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const duration = 1.0 + Math.random() * 1.5;
    const delay = Math.random() * 0.2;
    const colors = ['text-pink-500', 'text-red-500', 'text-purple-500', 'text-pink-400', 'text-rose-500'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    return { id: i, text, x, y, duration, delay, color };
  });
}

export default function App() {
  const [userRole, setUserRole] = useState<'sudila' | 'kithumi' | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [targetRole, setTargetRole] = useState<'sudila' | 'kithumi' | null>(null);
  const [explosions, setExplosions] = useState<any[]>([]);

  const handleSudilaClick = () => {
    setTargetRole('sudila');
    setPasswordInput('');
  };

  const handleKithumiClick = () => {
    setTargetRole('kithumi');
    setPasswordInput('');
  };

  const handleHeartClick = () => {
    setExplosions(generateExplosions());
    setTimeout(() => setExplosions([]), 3500);
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (targetRole === 'sudila' && passwordInput.toLowerCase() === 'floobs') {
      setUserRole('sudila');
      setTargetRole(null);
    } else if (targetRole === 'kithumi' && passwordInput === 'Sushuswife') {
      setUserRole('kithumi');
      setTargetRole(null);
    } else if (targetRole === 'kithumi' && passwordInput.toLowerCase() === 'sushuswife') { // just in case they don't capitalize
      setUserRole('kithumi');
      setTargetRole(null);
    } else {
      alert('Wrong password!');
    }
  };

  if (userRole === 'sudila') {
    return <SudilaView />;
  }

  if (userRole === 'kithumi') {
    return <KithumiView />;
  }

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 space-y-8 text-center border-4 border-pink-200">
        <div className="relative inline-block cursor-pointer" onClick={handleHeartClick}>
          <Heart className="w-16 h-16 text-pink-500 mx-auto animate-pulse hover:scale-110 transition-transform" />
          <AnimatePresence>
            {explosions.map((exp) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 1.5, x: exp.x, y: exp.y }}
                exit={{ opacity: 0 }}
                transition={{ duration: exp.duration, delay: exp.delay, ease: "easeOut" }}
                className={`absolute left-0 top-0 w-full h-full flex items-center justify-center font-bold whitespace-nowrap pointer-events-none drop-shadow-sm ${exp.color}`}
              >
                {exp.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <h1 className="text-3xl font-bold text-pink-600 font-serif">Who is visiting?</h1>
        
        {!targetRole ? (
          <div className="space-y-4">
            <button
               onClick={handleKithumiClick}
              className="w-full py-4 bg-pink-400 hover:bg-pink-500 text-white rounded-xl font-bold text-lg transition-colors shadow-md"
            >
              I am Kithumi 🌸
            </button>
            <button
              onClick={handleSudilaClick}
              className="w-full py-4 bg-blue-400 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-colors shadow-md"
            >
              I am Sudila 👦
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <p className="text-gray-600 font-medium">
              Enter password for {targetRole === 'sudila' ? 'Sudila' : 'Kithumi'}:
            </p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-3 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500 text-center"
              placeholder="Password..."
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTargetRole(null)}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className={`flex-1 py-3 text-white rounded-xl font-bold transition-colors ${targetRole === 'kithumi' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                Enter
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
