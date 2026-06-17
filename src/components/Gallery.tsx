import { useState } from 'react';
import { ArrowLeft, Mail, Heart } from 'lucide-react';

interface GalleryProps {
  onBack: () => void;
}

export default function Gallery({ onBack }: GalleryProps) {
  const [showLetter, setShowLetter] = useState(false);

  const galleryItems = [
    { type: 'image', id: '19p7OHu4FNDiL_sbp3pYPi-NEDMHLY3Gu', caption: 'First time we met:' },
    { type: 'image', id: '1Ltx6R7pCYDYXMeDz0r2g0_z812_NcvLS', caption: 'My first 0.5 of you:' },
    { type: 'image', id: '15oNNe_Q24O9XgYLcFzISYexkuRmEQ4Cq', caption: 'Our first official date:' },
    { type: 'image', id: '1ZZwZVCq7-opxgi0ZbB8Wga0CJ07OMDj3', caption: 'You drinking that smoothie looking cute:' },
    { type: 'image', id: '1zMvup03LbLVZQaR2FJZXqo2NrqpzOqYc', caption: 'Our second official date:\n(I remember kissing you in the lift of OGF)' },
    { type: 'image', id: '1WP3ncuUf0G45bbFRJ1kDNHoOB3Cr08lV', caption: 'Meeting you again after months:\nI missed you' },
    { type: 'image', id: '1_8TMV8dhO_0FBY92j6Nn_JAsMZYQ9SRd', caption: "I know how you feel about this place and I'm genuinely sorry and I'm never taking you anywhere like this again but holding you in my arms and feeling you close to me is something I'll never forget and I hope you don't too:" },
    { type: 'image', id: '1T6x6qPiUXx9VL2DVzXADaaa1Eko0BtRH', caption: "Staring into your eyes makes everything else disappear:" },
    { type: 'video', id: '1DvoNuT082VdfykFbaHmfWEOZtusc4Ab2', caption: "Being with you, being able to call you mine is the best thing that has ever happened to me and I'm soo blessed to be able to live the rest of my life with you and I can't wait to keep making you happy forever:" }
  ];

  return (
    <div className="min-h-screen bg-pink-50 py-8 relative font-sans">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-pink-600 font-bold hover:text-pink-700 transition-colors bg-white px-4 py-2 rounded-full shadow-sm group border-2 border-pink-100"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          
          <button 
            onClick={() => setShowLetter(true)}
            className="p-4 bg-amber-100 border-2 border-amber-300 text-amber-800 rounded-full shadow-md hover:bg-amber-200 transition-transform hover:scale-105 group relative"
            aria-label="Open Letter"
          >
            <Mail className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce text-white flex items-center justify-center text-[10px] font-bold">1</span>
          </button>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-pink-600 font-serif mb-4 flex justify-center gap-4 items-center">
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
            My Love To You
            <Heart className="w-8 h-8 text-pink-500 fill-pink-500" />
          </h2>
          <p className="text-pink-800/70 font-medium">Looking back at our beautiful memories 💕</p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {galleryItems.map((item, index) => (
            <div key={`item-${index}`} className="break-inside-avoid relative group rounded-2xl overflow-hidden bg-white p-3 shadow-md border border-pink-100 flex flex-col hover:shadow-lg transition-shadow">
              {item.type === 'image' ? (
                 <img 
                   src={`https://drive.google.com/thumbnail?id=${item.id}&sz=w1000`} 
                   alt={`Memory ${index + 1}`} 
                   className="w-full h-auto rounded-xl object-cover"
                   referrerPolicy="no-referrer"
                 />
              ) : (
                 <iframe 
                   src={`https://drive.google.com/file/d/${item.id}/preview`} 
                   className="w-full aspect-video rounded-xl border-0"
                   allow="autoplay; fullscreen"
                 />
              )}
              <div className="mt-3 p-2 bg-pink-50 rounded-xl">
                 <p className="text-sm font-medium text-pink-800 italic whitespace-pre-wrap">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showLetter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f4e4bc] w-full max-w-2xl rounded-sm p-8 md:p-12 shadow-2xl relative" 
               style={{ 
                 backgroundImage: 'url("https://www.transparenttextures.com/patterns/old-wall.png")',
                 boxShadow: 'inset 0 0 50px rgba(139, 69, 19, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
               }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#c2a77a] rounded-full shadow-md" />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#c2a77a] rounded-full shadow-md" />
            
            <div className="prose prose-pink mx-auto">
              <h2 className="text-3xl font-serif text-[#5c3a21] text-center mb-8 border-b-2 border-[#c2a77a] pb-4">
                To my forever, Kithumi
              </h2>
              <div className="text-lg leading-loose text-[#4a3018] font-serif space-y-4 mb-12">
                <p>
                  My sweetest girl,
                </p>
                <p>
                  I know these past months have been very hard on us, but I'm soo proud of you and us for getting through everything. I know we still have a bunch of stuff to sort out together, and we will solve it all because I can't imagine going through this world without you as my one, my guiding light, my cheerleader.
                </p>
                <p>
                  I love you and care about you my sweet angel, and I don't care how many times we argue or how many times you push me away, I'm never letting go. I love you soo much
                </p>
                <p>
                  I love you so much. Every single moment with you is a blessing. You are my sunshine, my endless happiness, and the absolute love of my life.
                </p>
                <p>
                  These two years have been the best years of my life, and I can't wait to spend forever with you. You make my world complete.
                </p>
                <p>
                  Yours always and forever,
                </p>
                <p className="text-2xl font-bold italic text-[#8b4513] pt-4">
                  Sudila aka Sushu ❤️
                </p>
              </div>

              <div className="text-center mt-12 border-t-2 border-[#c2a77a] pt-8">
                <button 
                  onClick={() => setShowLetter(false)}
                  className="px-8 py-3 bg-[#8b4513] text-[#f4e4bc] font-bold rounded-lg shadow-lg hover:bg-[#5c3a21] transition-colors border-2 border-[#5c3a21] font-serif text-lg"
                >
                  I love you too my sweet boy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
