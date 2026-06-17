import { useState } from 'react';
import { ArrowLeft, Lock, Heart, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isSameDay, isAfter, isToday, addMonths, subMonths, startOfDay
} from 'date-fns';

const LOVE_NOTES = [
  "You make my world so much brighter.",
  "I fall in love with you a little more every day.",
  "Your smile is my favorite thing in the world.",
  "I am so lucky to have you as my sweet girl.",
  "Every moment with you feels like magic.",
  "You are my absolute favorite person.",
  "Just thinking about you makes me smile.",
  "I cherish every memory we've made together.",
  "You are the best thing that ever happened to me.",
  "I love the way you look at me.",
  "My heart beats faster when you're near.",
  "You are my dream come true.",
  "Nobody understands me like you do.",
  "I can't imagine my life without you.",
  "You are my sunshine on a rainy day.",
  "Forever isn't long enough with you.",
  "I love everything about you.",
  "You make everyday special.",
  "I am endlessly fascinated by you.",
  "You have my whole heart, forever.",
  "You are my soulmate and my best friend.",
  "Thank you for being you, my love.",
  "You are the most beautiful person I know, inside and out.",
  "I love your laugh more than anything.",
  "You make me want to be the best version of myself.",
  "Every day with you is a gift.",
  "I love holding your hand.",
  "You're my safe place.",
  "You are the love of my life.",
  "I will always choose you.",
  "You and me, forever. ❤️"
];

const getNoteForDay = (date: Date) => {
  // Use the day of the year to pick a note consistently
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return LOVE_NOTES[dayOfYear % LOVE_NOTES.length];
};

interface CalendarProps {
  onBack: () => void;
}

export default function Calendar({ onBack }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const today = startOfDay(new Date());

  const padDays = startOfMonth(currentMonth).getDay();
  const padding = Array.from({ length: padDays }).map((_, i) => <div key={`pad-${i}`} className="h-16" />);

  const handleDayClick = (date: Date) => {
    if (isAfter(date, today)) return;
    setSelectedDate(date);
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center py-8 font-sans">
      <div className="w-full max-w-3xl px-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-pink-600 font-bold mb-8 hover:text-pink-700 transition-colors bg-white px-4 py-2 rounded-full shadow-sm w-fit group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-pink-100">
          <div className="bg-pink-400 text-white flex justify-between items-center p-6">
            <button onClick={prevMonth} className="p-2 hover:bg-pink-500 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold font-serif flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-pink-500 rounded-full transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 text-center text-pink-300 font-bold mb-4 text-sm">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d}>{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {padding}
              {days.map(date => {
                const isLocked = isAfter(date, today);
                const isCurrentToday = isToday(date);
                
                return (
                 <button 
                    key={date.toISOString()}
                    onClick={() => handleDayClick(date)}
                    disabled={isLocked}
                    className={`
                      h-14 sm:h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all
                      ${isCurrentToday ? 'bg-pink-100 border-2 border-pink-500' : 'bg-pink-50 border border-pink-100'}
                      ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:bg-pink-200 cursor-pointer shadow-sm'}
                    `}
                  >
                    <span className={`font-bold ${isLocked ? 'text-gray-400' : 'text-pink-600'}`}>
                      {format(date, 'd')}
                    </span>
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-pink-300" />
                    ) : (
                      <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 bg-pink-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedDate(null)}>
          <div 
            className="bg-white max-w-md w-full rounded-3xl p-8 text-center shadow-2xl scale-100 transition-transform relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-8 bg-pink-400" />
            <div className="mt-4 flex flex-col text-center items-center justify-center">
               <Heart className="w-12 h-12 text-pink-500 fill-pink-500 animate-pulse mb-6" />
               <p className="text-xl text-gray-500 font-medium mb-2">Note for {format(selectedDate, 'MMM do, yyyy')}</p>
               <h3 className="text-3xl font-serif text-pink-600 font-bold italic leading-relaxed">
                  "{getNoteForDay(selectedDate)}"
               </h3>
               <button 
                onClick={() => setSelectedDate(null)}
                className="mt-8 px-8 py-3 bg-pink-100 text-pink-600 font-bold rounded-full hover:bg-pink-200 transition-colors"
               >
                 Close ❤️
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
