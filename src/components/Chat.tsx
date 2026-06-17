import { useState, useEffect, useRef, FormEvent } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';

interface ChatProps {
  onClose: () => void;
  viewer: 'sudila' | 'kithumi';
}

interface Message {
  id: string;
  text: string;
  sender: 'sudila' | 'kithumi';
  createdAt: any;
}

export default function Chat({ onClose, viewer }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data({ serverTimestamps: 'estimate' })
      })) as Message[];
      setMessages(msgs);
    }, (error) => {
      console.error("Chat snapshot error:", error);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const text = inputText.trim();
    setInputText('');

    try {
      await addDoc(collection(db, 'messages'), {
        text,
        sender: viewer,
        createdAt: serverTimestamp()
      });
      console.log("Message sent:", text);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message: " + (error as Error).message);
    }
  };

  const handleClearChat = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'messages'));
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log("Chat cleared.");
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 md:bottom-4 md:right-4 w-full md:w-96 h-[80vh] md:h-[500px] bg-white md:rounded-2xl shadow-2xl flex flex-col border-t-2 md:border-2 border-pink-200 overflow-hidden z-50 transition-all">
      <div className="bg-pink-500 p-4 flex justify-between items-center text-white">
        <div>
          <h3 className="font-bold text-lg">
            {viewer === 'kithumi' ? 'Chat with Sudila 💕' : 'Chat with Kithumi 💕'}
          </h3>
        </div>
        <div className="flex gap-2">
          {viewer === 'sudila' && (
            <button onClick={handleClearChat} className="p-1 hover:bg-pink-600 rounded-full transition-colors" title="Clear Chat">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-pink-600 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-pink-50 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.sender === viewer;
          const kithumiImg = "https://drive.google.com/thumbnail?id=1uNfiakRLsK_bzNjUpxdlg3ydzyM_qorO&sz=w200";
          const sudilaImg = "https://drive.google.com/thumbnail?id=101q83yX4KL4FBXZbkOGVqjJsRay-Ill7&sz=w200";
          const PfpSrc = msg.sender === 'kithumi' ? kithumiImg : sudilaImg;
          
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
              {!isMine && (
                <img src={PfpSrc} alt={msg.sender} className="w-8 h-8 rounded-full object-cover shadow-sm mb-1 bg-white" referrerPolicy="no-referrer" />
              )}
              <div className={`max-w-[75%] p-3 rounded-2xl ${
                isMine 
                  ? 'bg-pink-500 text-white rounded-br-sm' 
                  : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
              }`}>
                <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
              </div>
              {isMine && (
                <img src={PfpSrc} alt={msg.sender} className="w-8 h-8 rounded-full object-cover shadow-sm mb-1 bg-white" referrerPolicy="no-referrer" />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
        />
        <button 
          type="submit"
          className="p-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
