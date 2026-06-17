import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, RefreshCw, Trophy, Trash2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface GameProps {
  onBack: () => void;
  viewer: 'sudila' | 'kithumi';
}

const GRAVITY = 0.04;
const JUMP_STRENGTH = -2.0;
const OBSTACLE_SPEED = 1.0;
const OBSTACLE_WIDTH = 60;
const GAP_SIZE = 220;
const SPAWN_RATE = 120; // frames

interface Highscores {
  sudila: number;
  kithumi: number;
}

// Add links starting with "https://drive.google.com/uc?export=view&id=" followed by your Google Drive image ID.
const IMAGES = {
  kithumi: "https://drive.google.com/thumbnail?id=1uNfiakRLsK_bzNjUpxdlg3ydzyM_qorO&sz=w200", 
  sudila: "https://drive.google.com/thumbnail?id=101q83yX4KL4FBXZbkOGVqjJsRay-Ill7&sz=w200"
};

export default function Game({ onBack, viewer }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highscores, setHighscores] = useState<Highscores>({ sudila: 0, kithumi: 0 });
  const highscoresRef = useRef<Highscores>({ sudila: 0, kithumi: 0 });
  const [playerCharacter, setPlayerCharacter] = useState<'kithumi' | 'sudila'>('kithumi');
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imgRefs = useRef<Record<string, HTMLImageElement>>({});

  // Game state refs (to avoid relying on state in RAF)
  const stateRef = useRef({
    birdY: 250,
    velocity: 0,
    obstacles: [] as { x: number; topHeight: number; passed: boolean }[],
    hearts: [] as { x: number; y: number; collected: boolean }[],
    frameCount: 0,
    score: 0,
    isDead: false,
  });

  // DB Sync and Image loading
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'highscores', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Highscores;
        const updatedHighscores = {
          sudila: data.sudila || 0,
          kithumi: data.kithumi || 0
        };
        setHighscores(updatedHighscores);
        highscoresRef.current = updatedHighscores;
      }
    }, (error) => {
      console.error("Highscore snapshot error:", error);
    });

    const loadImg = (src: string) => {
      return new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });
    };

    Promise.all([loadImg(IMAGES.sudila), loadImg(IMAGES.kithumi)]).then(([s, k]) => {
      if (s) imgRefs.current.sudila = s;
      if (k) imgRefs.current.kithumi = k;
      setImagesLoaded(true);
    });

    return () => unsub();
  }, []);

  const saveHighscore = async (newScore: number) => {
    try {
      const currentHighscores = highscoresRef.current;
      console.log(`Attempting to save highscore... current DB kithumi: ${currentHighscores.kithumi}, sudila: ${currentHighscores.sudila}. Player: ${playerCharacter}, Score: ${newScore}`);
      
      if (playerCharacter === 'kithumi' && newScore > currentHighscores.kithumi) {
        await setDoc(doc(db, 'highscores', 'global'), {
          kithumi: newScore
        }, { merge: true });
        console.log("Saved new kithumi highscore:", newScore);
      } else if (playerCharacter === 'sudila' && newScore > currentHighscores.sudila) {
        await setDoc(doc(db, 'highscores', 'global'), {
          sudila: newScore
        }, { merge: true });
        console.log("Saved new sudila highscore:", newScore);
      }
    } catch (error) {
      console.error("Failed to save highscore:", error);
    }
  };

  const jump = () => {
    if (stateRef.current.isDead) return;
    stateRef.current.velocity = JUMP_STRENGTH;
  };

  const startGame = () => {
    cancelAnimationFrame(requestRef.current);
    stateRef.current = {
      birdY: 250,
      velocity: 0,
      obstacles: [],
      hearts: [],
      frameCount: 0,
      score: 0,
      isDead: false,
    };
    setScore(0);
    setGameOver(false);
    
    if (isPlaying) {
      // If it was already playing, we just reset the state and manually restart the loop
      // since the useEffect won't trigger (isPlaying hasn't changed).
      requestRef.current = requestAnimationFrame(updateGame);
    } else {
      // The useEffect will catch the change to true and start the loop.
      setIsPlaying(true);
    }
  };

  const updateGame = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;

    if (s.isDead) {
      setIsPlaying(false);
      setGameOver(true);
      saveHighscore(s.score);
      return;
    }

    // Physics
    s.velocity += GRAVITY;
    s.birdY += s.velocity;

    // Floor/Ceiling collision
    if (s.birdY > canvas.height - 20 || s.birdY < 0) {
      s.isDead = true;
    }

    // Spawn obstacles
    s.frameCount++;
    if (s.frameCount % SPAWN_RATE === 0) {
      const topHeight = Math.random() * (canvas.height - GAP_SIZE - 100) + 50;
      s.obstacles.push({ x: canvas.width, topHeight, passed: false });
      // Spawn heart randomly in the gap
      s.hearts.push({ 
        x: canvas.width + OBSTACLE_WIDTH/2, 
        y: topHeight + GAP_SIZE/2, 
        collected: false 
      });
    }

    // Move and check collisions
    const birdX = 100;
    const hitRadius = 20;

    for (let i = 0; i < s.obstacles.length; i++) {
        const obs = s.obstacles[i];
        obs.x -= OBSTACLE_SPEED;

        // Passed obstacle (score)
        if (!obs.passed && obs.x + OBSTACLE_WIDTH < birdX) {
            obs.passed = true;
        }

        // Collision logic
        const hitX = birdX + hitRadius > obs.x && birdX - hitRadius < obs.x + OBSTACLE_WIDTH;
        const hitTop = s.birdY - hitRadius < obs.topHeight;
        const hitBot = s.birdY + hitRadius > obs.topHeight + GAP_SIZE;

        if (hitX && (hitTop || hitBot)) {
            s.isDead = true;
        }
    }

    // Hearts (collectibles)
    for (let i = 0; i < s.hearts.length; i++) {
        const h = s.hearts[i];
        if (!h.collected) {
            h.x -= OBSTACLE_SPEED;
            // Distance check
            const dx = h.x - birdX;
            const dy = h.y - s.birdY;
            if (Math.hypot(dx, dy) < hitRadius + 20) {
                h.collected = true;
                s.score += 1;
                // Update React state immediately to reflect in top bar
                setScore(s.score); 
                saveHighscore(s.score);
            }
        }
    }

    // Clean up off-screen
    s.obstacles = s.obstacles.filter(o => o.x + OBSTACLE_WIDTH > -100);
    s.hearts = s.hearts.filter(h => h.x > -100);

    // DRAW
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background (Pink sky)
    ctx.fillStyle = '#fdf2f8'; // pink-50
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw obstacles (Love Towers)
    ctx.fillStyle = '#f472b6'; // pink-400
    for (const obs of s.obstacles) {
      // Top tower
      ctx.fillRect(obs.x, 0, OBSTACLE_WIDTH, obs.topHeight);
      // Bottom tower
      ctx.fillRect(obs.x, obs.topHeight + GAP_SIZE, OBSTACLE_WIDTH, canvas.height - obs.topHeight - GAP_SIZE);
      
      // Decorations on tower
      ctx.fillStyle = '#db2777'; // pink-600 outline
      ctx.strokeRect(obs.x, 0, OBSTACLE_WIDTH, obs.topHeight);
      ctx.strokeRect(obs.x, obs.topHeight + GAP_SIZE, OBSTACLE_WIDTH, canvas.height - obs.topHeight - GAP_SIZE);
      ctx.fillStyle = '#f472b6';
    }

    // Draw Hearts
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const h of s.hearts) {
        if (!h.collected) {
            ctx.fillText('💖', h.x, h.y);
            // Glowing effect
            ctx.shadowColor = '#f472b6';
            ctx.shadowBlur = 10;
        }
    }
    ctx.shadowBlur = 0; // reset

    // Draw Bird Image
    const activeImg = playerCharacter === 'kithumi' ? imgRefs.current.kithumi : imgRefs.current.sudila;
    
    if (activeImg) {
       const imgSize = 40;
       ctx.save();
       ctx.beginPath();
       ctx.arc(birdX, s.birdY, imgSize/2, 0, Math.PI * 2);
       ctx.clip();
       
       // Fallback background color if image isn't fully loaded
       ctx.fillStyle = '#fbcfe8';
       ctx.fill();
       
       ctx.drawImage(activeImg, birdX - imgSize/2, s.birdY - imgSize/2, imgSize, imgSize);
       
       ctx.lineWidth = 3;
       ctx.strokeStyle = playerCharacter === 'kithumi' ? '#ec4899' : '#3b82f6';
       ctx.stroke();
       ctx.restore();
    } else {
       // Fallback emoji
       ctx.font = '32px Arial';
       ctx.fillText(playerCharacter === 'kithumi' ? '👧' : '👦', birdX, s.birdY);
    }

    // Draw Score top-left directly so it's smooth
    ctx.fillStyle = '#db2777'; // pink-600
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${s.score}`, 20, 30);

    if (!s.isDead) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, playerCharacter]); // restart loop if character changes mid-flight (unlikely but safe)

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't prevent default if the user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (isPlaying) {
          e.preventDefault();
        }
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  if (!imagesLoaded) {
     return <div className="min-h-screen bg-pink-100 flex items-center justify-center font-bold text-pink-600">Loading magic...</div>;
  }

  return (
    <div className="min-h-screen bg-pink-100 flex flex-col items-center justify-center p-4 font-sans select-none">
      
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-pink-200 flex flex-col md:flex-row">
        
        {/* Play Area */}
        <div className="flex-1 relative flex flex-col items-center p-4 md:border-r border-pink-100">
           
           <div className="w-full flex justify-between items-center mb-4">
             {viewer === 'kithumi' ? (
                <button 
                  onClick={onBack}
                  className="p-2 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
             ) : (
                <div /> // Sudila has no back button to keep it secret.
             )}
             <div className="flex items-center gap-2 bg-pink-100 px-4 py-2 rounded-full font-bold text-pink-600">
                <Trophy className="w-5 h-5" /> 💖 Highscore Game
             </div>
           </div>

           <div className="relative rounded-2xl overflow-hidden border-4 border-pink-200 shadow-inner bg-pink-50"
                onClick={jump}
                onTouchStart={jump}>
               <canvas 
                 ref={canvasRef} 
                 width={400} 
                 height={500} 
                 className={`block w-full max-w-sm ${gameOver ? 'opacity-50 blur-sm' : ''}`}
                 style={{ touchAction: 'none' }}
               />

               {!isPlaying && !gameOver && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 z-10 transition-colors">
                    <button 
                      onClick={startGame}
                      className="p-6 bg-pink-500 text-white rounded-full animate-bounce shadow-xl border-4 border-white hover:bg-pink-600 hover:scale-110 transition-all font-bold text-xl flex items-center justify-center gap-2"
                    >
                      <Play className="w-8 h-8 fill-white" />
                    </button>
                 </div>
               )}

               {gameOver && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-pink-900/40 z-10 p-6 text-center">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-pink-300">
                      <h3 className="text-3xl font-black text-pink-600 mb-2">Game Over!</h3>
                      <p className="text-xl font-bold text-gray-700 mb-6">Hearts Collected: {stateRef.current.score}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); startGame(); }}
                        className="py-3 px-8 bg-pink-500 text-white border-2 border-pink-600 rounded-xl font-bold hover:bg-pink-600 transition-colors flex items-center gap-2 mx-auto shadow-md"
                      >
                        <RefreshCw className="w-5 h-5" /> Play Again
                      </button>
                    </div>
                 </div>
               )}

               {isPlaying && !gameOver && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); startGame(); }}
                    className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-pink-500 transition-colors border-2 border-pink-200"
                    aria-label="Restart"
                  >
                    <RefreshCw className="w-6 h-6" />
                  </button>
               )}
           </div>

           {/* Character Selection */}
           {!isPlaying && !gameOver && (
             <div className="mt-6 flex flex-col items-center">
               <p className="text-sm font-bold text-pink-600 mb-2">Choose your character:</p>
               <div className="flex gap-4">
                 <button 
                    onClick={() => setPlayerCharacter('kithumi')}
                    className={`w-14 h-14 rounded-full border-4 overflow-hidden transition-all ${playerCharacter === 'kithumi' ? 'border-pink-500 scale-110 shadow-lg' : 'border-transparent hover:scale-105 opacity-70 hover:opacity-100'}`}
                 >
                   <img src={IMAGES.kithumi} alt="Kithumi" className="w-full h-full object-cover" />
                 </button>
                 <button 
                    onClick={() => setPlayerCharacter('sudila')}
                    className={`w-14 h-14 rounded-full border-4 overflow-hidden transition-all ${playerCharacter === 'sudila' ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent hover:scale-105 opacity-70 hover:opacity-100'}`}
                 >
                   <img src={IMAGES.sudila} alt="Sudila" className="w-full h-full object-cover" />
                 </button>
               </div>
             </div>
           )}

           {/* Mobile Jump hint */}
           <p className="mt-4 text-xs font-bold text-pink-400 italic">Tap or Spacebar to jump</p>

        </div>

        {/* Leaderboard Area */}
        <div className="w-full md:w-64 bg-pink-50 p-6 flex flex-col">
           <div className="flex justify-between items-center mb-6 border-b-2 border-pink-200 pb-2">
             <h3 className="text-xl font-black text-pink-600 font-serif flex items-center gap-2">
               <Trophy className="w-5 h-5" /> 
               Highscores
             </h3>
             {viewer === 'sudila' && (
               <button 
                 onClick={async () => {
                   await setDoc(doc(db, 'highscores', 'global'), { sudila: 0, kithumi: 0 });
                 }}
                 className="p-1.5 text-pink-400 hover:text-pink-600 hover:bg-pink-100 rounded-full transition-colors"
                 title="Reset Scores"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
             )}
           </div>
           
           <div className="space-y-6">
             <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                <p className="text-sm font-bold text-blue-600 flex justify-between items-center">
                  Sudila 👦
                  <span className="text-xl font-black bg-blue-100 px-3 py-1 rounded-lg group-hover:scale-110 transition-transform">{highscores.sudila}</span>
                </p>
             </div>

             <div className="bg-white p-4 rounded-xl border border-pink-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                <p className="text-sm font-bold text-pink-600 flex justify-between items-center">
                  Kithumi 🌸
                  <span className="text-xl font-black bg-pink-100 px-3 py-1 rounded-lg group-hover:scale-110 transition-transform">{highscores.kithumi}</span>
                </p>
             </div>
           </div>

           <div className="mt-8 pt-6 border-t border-pink-200 text-xs text-pink-400 font-medium text-center italic">
             No matter how high you score, I still love you more 😉💕
           </div>
        </div>

      </div>
    </div>
  );
}
