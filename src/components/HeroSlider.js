"use client";
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const banners = [
  {
    id: 1,
    bg: "bg-gradient-to-r from-blue-900 to-blue-700",
    title: "Big Laptop Sale",
    subtitle: "Up to 70% Off on Refurbished Dells & HPs",
    image: "💻" 
  },
  {
    id: 2,
    bg: "bg-gradient-to-r from-emerald-800 to-green-600",
    title: "iPhone Dhamaka",
    subtitle: "iPhone 13 starting at ₹32,999 only",
    image: "📱"
  },
  {
    id: 3,
    bg: "bg-gradient-to-r from-purple-900 to-indigo-800",
    title: "Student Special",
    subtitle: "Laptops under ₹15,000 for Coding",
    image: "🎓"
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent(current === banners.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? banners.length - 1 : current - 1);

  return (
    <div className="relative w-full h-[250px] md:h-[350px] overflow-hidden bg-gray-200">
      
      {/* Slides */}
      {banners.map((banner, index) => (
        <div 
          key={banner.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out transform flex items-center justify-center text-white ${banner.bg}`}
          style={{ transform: `translateX(${100 * (index - current)}%)` }}
        >
          <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center">
             <div className="w-2/3">
                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded mb-2 inline-block">Limited Time Deal</span>
                <h2 className="text-3xl md:text-5xl font-bold mb-2">{banner.title}</h2>
                <p className="text-lg md:text-xl text-gray-200 mb-6">{banner.subtitle}</p>
                <button className="bg-white text-gray-900 px-6 py-2 rounded font-bold hover:bg-gray-100 transition">
                  Check Offers
                </button>
             </div>
             <div className="text-9xl animate-bounce hidden md:block">
               {banner.image}
             </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50">
        <ChevronLeft />
      </button>
      <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50">
        <ChevronRight />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-2 h-2 rounded-full transition-all ${current === idx ? "bg-white w-6" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}