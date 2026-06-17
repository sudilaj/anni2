import { useState, useRef, useEffect } from 'react';
import Calendar from './Calendar';
import Game from './Game';
import Gallery from './Gallery';
import Chat from './Chat';
import { MessageSquare, HelpCircle, ArrowLeft, Music, Music2, X } from 'lucide-react';

export default function KithumiView() {
  const [currentView, setCurrentView] = useState<'main' | 'calendar' | 'game' | 'gallery'>('main');
  const [showChat, setShowChat] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const startAudio = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.2; // Low background music
        audioRef.current.play().then(() => setIsPlaying(true)).catch(e => {
          console.log("Autoplay prevented:", e);
          setIsPlaying(false);
        });
      }
    };

    startAudio();

    // Fallback: try to play when user clicks anywhere on the page
    const handleFirstInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        startAudio();
      }
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(e => console.error("Play failed:", e));
        setIsPlaying(true);
      }
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'calendar':
        return <Calendar onBack={() => setCurrentView('main')} />;
      case 'game':
        return <Game viewer="kithumi" onBack={() => setCurrentView('main')} />;
      case 'gallery':
        return <Gallery onBack={() => setCurrentView('main')} />;
      default:
        return (
          <div className="min-h-screen bg-pink-50 flex flex-col items-center py-12 px-4 text-center font-sans">
            <div className="absolute top-4 right-4 flex gap-4">
              <button 
                onClick={toggleMusic}
                className="p-3 bg-white text-pink-500 rounded-full shadow-md hover:bg-pink-100 transition-colors"
                aria-label={isPlaying ? "Pause Music" : "Play Music"}
              >
                {isPlaying ? <Music className="w-6 h-6" /> : <Music2 className="w-6 h-6 opacity-40" />}
              </button>
              <button 
                onClick={() => setShowHintModal(true)}
                className="p-3 bg-white text-pink-500 rounded-full shadow-md hover:bg-pink-100 transition-colors"
                aria-label="Hint"
              >
                <HelpCircle className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setShowChat(true)}
                className="p-3 bg-pink-500 text-white rounded-full shadow-md hover:bg-pink-600 transition-colors relative"
                aria-label="Message"
              >
                <MessageSquare className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
              </button>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-10 mt-8">
              {/* Bouquet Image Placeholder - waiting for link */}
              <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-8 border-white shadow-2xl bg-pink-100 flex items-center justify-center">
                <img 
                  src="https://drive.google.com/thumbnail?id=1I3G7Q9HpAVx8fJRLDL0PMbDigkPwtQ8P&sz=w1000" 
                  alt="Bouquet"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-pink-600 font-serif leading-tight">
                  HAPPY 2 YEAR ANNIVERSARY 
                  <br/>
                  MY LOVE
                </h1>
                <p className="text-xl md:text-2xl text-pink-800 font-medium italic">
                  I love you soo much my sweet girl
                  <br/>
                  and I cant wait to spend my forever with you.
                </p>
              </div>

              <div className="flex flex-col gap-6 w-full max-w-sm mx-auto pt-8">
                <button 
                  onClick={() => setCurrentView('calendar')}
                  className="py-4 px-8 bg-white border-2 border-pink-300 text-pink-600 rounded-2xl shadow-[0_8px_0_0_rgba(244,114,182,0.3)] hover:shadow-[0_4px_0_0_rgba(244,114,182,0.3)] hover:translate-y-[4px] font-bold text-xl transition-all"
                >
                  Open when 💌
                </button>
                <button 
                  onClick={() => setCurrentView('game')}
                  className="py-4 px-8 bg-pink-400 border-2 border-pink-500 text-white rounded-2xl shadow-[0_8px_0_0_rgba(236,72,153,1)] hover:shadow-[0_4px_0_0_rgba(236,72,153,1)] hover:translate-y-[4px] font-bold text-xl transition-all"
                >
                  Who loves who more 🎮
                </button>
                <button 
                  onClick={() => setCurrentView('gallery')}
                  className="py-4 px-8 bg-red-400 border-2 border-red-500 text-white rounded-2xl shadow-[0_8px_0_0_rgba(239,68,68,1)] hover:shadow-[0_4px_0_0_rgba(239,68,68,1)] hover:translate-y-[4px] font-bold text-xl transition-all"
                >
                  My love to you 📸
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      {/* Background Music */}
      <audio 
        ref={audioRef}
        src="/background.mp3" 
        autoPlay 
        loop
      />
      {renderView()}
      {showHintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border-4 border-pink-200 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowHintModal(false)}
              className="absolute top-4 right-4 p-2 text-pink-400 hover:text-pink-600 hover:bg-pink-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black text-pink-600 font-serif mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6" /> 
              A Little Hint
            </h2>
            <div className="space-y-4 text-pink-800 text-lg">
              <p>
                The <strong>message icon</strong> lets us text each other in real time! You can reply to my messages or talk to me right here. 💕
              </p>
              <p>
                Every button below holds a piece of my heart for you. Open them to explore and discover the surprises!
              </p>
            </div>
            <button
              onClick={() => setShowHintModal(false)}
              className="mt-8 w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors"
            >
              Okay, got it!
            </button>
          </div>
        </div>
      )}

      {showChat && <Chat onClose={() => setShowChat(false)} viewer="kithumi" />}
    </>
  );
}
