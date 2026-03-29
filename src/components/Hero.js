import Link from 'next/link';
import { ShieldCheck, Truck, RotateCcw, Cpu } from 'lucide-react';

export default function Hero() {
  return (
    <div className="bg-gray-50">
      {/* 1. Main Banner Area */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          
          {/* Left Side: Text */}
          <div className="md:w-1/2 space-y-6 text-center md:text-left z-10">
            <div className="inline-block bg-blue-600/30 px-4 py-1 rounded-full text-sm font-semibold border border-blue-400/30 backdrop-blur-sm animate-pulse">
              🎉 Festive Sale is Live!
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Premium Tech,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Budget Price.</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-lg mx-auto md:mx-0">
              Get certified refurbished laptops & phones with up to <strong>70% OFF</strong>. Every device passes our 40-step quality check.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/shop" className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-3 rounded-full font-bold shadow-lg transition transform hover:scale-105">
                Shop Laptops
              </Link>
              <Link href="/shop" className="border-2 border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded-full font-semibold transition">
                View Mobiles
              </Link>
            </div>
          </div>

          {/* Right Side: Image Placeholder */}
          <div className="md:w-1/2 mt-10 md:mt-0 relative">
             {/* Hum yahan ek SVG illustration use kar rahe hain taaki image dhundhni na pade */}
             <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500">
                <div className="flex items-center gap-4 mb-4 border-b border-white/10 pb-4">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                   <div className="text-sm font-mono text-blue-200 ml-auto">DELL LATITUDE 7490</div>
                </div>
                <div className="h-48 bg-gray-900 rounded-lg flex items-center justify-center text-gray-500">
                   <Cpu size={64} className="text-blue-500 animate-bounce" />
                </div>
                <div className="mt-4 flex justify-between items-center">
                   <div>
                      <p className="text-xs text-gray-400">Current Price</p>
                      <p className="text-2xl font-bold">₹24,999 <span className="text-sm line-through text-gray-500">₹85,000</span></p>
                   </div>
                   <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold">In Stock</button>
                </div>
             </div>
             
             {/* Background Blob Effect */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full blur-[100px] opacity-30 -z-10"></div>
          </div>
        </div>
      </section>

      {/* 2. Trust Badges (Why Choose Us?) */}
      <section className="bg-white py-12 shadow-sm relative -mt-8 mx-4 md:mx-auto max-w-6xl rounded-xl z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
          
          <div className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition">
            <div className="bg-blue-100 p-3 rounded-full mb-4 text-blue-600">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">12 Months Warranty</h3>
            <p className="text-sm text-gray-500 mt-1">Full coverage on hardware issues</p>
          </div>

          <div className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition">
            <div className="bg-green-100 p-3 rounded-full mb-4 text-green-600">
              <RotateCcw size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">7 Days Easy Return</h3>
            <p className="text-sm text-gray-500 mt-1">No questions asked return policy</p>
          </div>

          <div className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition">
            <div className="bg-orange-100 p-3 rounded-full mb-4 text-orange-600">
              <Truck size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Free Pan-India Shipping</h3>
            <p className="text-sm text-gray-500 mt-1">Delivery within 3-5 business days</p>
          </div>

        </div>
      </section>
    </div>
  );
}