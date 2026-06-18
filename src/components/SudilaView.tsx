import { useState, useEffect } from 'react';
import Game from './Game';
import Chat from './Chat';
import { MessageSquare, Eye } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function SudilaView() {
  const [showChat, setShowChat] = useState(false);
  const [kithumiOpens, setKithumiOpens] = useState<number>(0);
  const [lastOpened, setLastOpened] = useState<string | null>(null);

  useEffect(() => {
    const statsRef = doc(db, 'analytics', 'views');
    const unsub = onSnapshot(statsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setKithumiOpens(data.kithumiOpens || 0);
        
        if (data.lastOpened) {
          // Check if it's a Firestore Timestamp or an ISO string
          const date = data.lastOpened?.toDate ? data.lastOpened.toDate() : new Date(data.lastOpened);
          setLastOpened(date.toLocaleString());
        }
      }
    });
    return () => unsub();
  }, []);

  return (
    <div className="w-full h-screen bg-pink-100 overflow-hidden relative">
      <Game viewer="sudila" onBack={() => window.location.reload()} />
      
      {/* Analytics Badge */}
      <div className="absolute top-4 left-4 z-40 bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border-2 border-blue-200 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-blue-600 font-bold">
          <Eye className="w-5 h-5" />
          <span>Kithumi Opens: {kithumiOpens}</span>
        </div>
        {lastOpened && (
          <div className="text-xs text-slate-500 font-medium">
            Last: {lastOpened}
          </div>
        )}
      </div>
      
      <button 
        onClick={() => setShowChat(true)}
        className="absolute top-4 right-4 p-3 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-colors z-40"
        aria-label="Message"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
      </button>

      {showChat && <Chat onClose={() => setShowChat(false)} viewer="sudila" />}
    </div>
  );
}
