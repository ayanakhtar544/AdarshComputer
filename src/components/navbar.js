import Link from 'next/link';
import { ShoppingCart, User, Search, Menu } from 'lucide-react';

export default function Navbar() {
  return (
<nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* 1. Logo Section */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">CHOUHAN</span>
            <span className="text-2xl font-bold text-gray-800 ml-1">COMPUTERS</span>
          </Link>

          {/* 2. Search Bar (Hidden on mobile) */}
          <div className="hidden md:flex flex-1 mx-8 max-w-lg">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search laptops, mobiles..." 
                className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-blue-500"
              />
              <button className="absolute right-3 top-2.5 text-gray-400 hover:text-blue-600">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* 3. Icons (Cart, Login) */}
          <div className="flex items-center gap-6">
            <Link href="/track-order" className="hidden md:block text-sm font-medium text-gray-600 hover:text-blue-600">
              Track Order
            </Link>
            
            <Link href="/login" className="flex items-center gap-1 text-gray-700 hover:text-blue-600">
              <User size={24} />
              <span className="hidden md:inline font-medium">Login</span>
            </Link>

            <Link href="/cart" className="relative text-gray-700 hover:text-blue-600">
              <ShoppingCart size={24} />
              {/* Cart Counter Badge */}
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Mobile Menu Icon */}
            <button className="md:hidden text-gray-700">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}