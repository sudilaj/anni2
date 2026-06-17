import { useState } from 'react';
import Game from './Game';
import Chat from './Chat';
import { MessageSquare } from 'lucide-react';

export default function SudilaView() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="w-full h-screen bg-pink-100 overflow-hidden relative">
      <Game viewer="sudila" onBack={() => window.location.reload()} />
      
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
