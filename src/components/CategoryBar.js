import { Laptop, Smartphone, Monitor, Headphones, Watch, Camera } from 'lucide-react';
import Link from 'next/link';

const categories = [
  { name: "Laptops", icon: Laptop, color: "bg-blue-100 text-blue-600" },
  { name: "Mobiles", icon: Smartphone, color: "bg-green-100 text-green-600" },
  { name: "Monitors", icon: Monitor, color: "bg-purple-100 text-purple-600" },
  { name: "Audio", icon: Headphones, color: "bg-orange-100 text-orange-600" },
  { name: "Watches", icon: Watch, color: "bg-pink-100 text-pink-600" },
  { name: "Cameras", icon: Camera, color: "bg-yellow-100 text-yellow-600" },
];

export default function CategoryBar() {
  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between md:justify-start md:gap-12 overflow-x-auto no-scrollbar">
          {categories.map((cat, idx) => (
            <Link key={idx} href={`/category/${cat.name.toLowerCase()}`} className="flex flex-col items-center min-w-[64px] group cursor-pointer">
              <div className={`w-12 h-12 ${cat.color} rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition`}>
                <cat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-gray-700 group-hover:text-blue-600">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}