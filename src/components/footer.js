import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Column 1: About */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-blue-400">LappyDekho</h3>
          <p className="text-gray-400 text-sm">
            Best quality refurbished laptops and mobiles. Verified, tested, and certified with warranty.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="font-bold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="/" className="hover:text-blue-400">Home</a></li>
            <li><a href="/shop" className="hover:text-blue-400">Laptops</a></li>
            <li><a href="/track-order" className="hover:text-blue-400">Track Order</a></li>
            <li><a href="/admin" className="hover:text-blue-400">Admin Login</a></li>
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div>
          <h4 className="font-bold mb-4">Contact Us</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <Phone size={16} /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> support@chouhan.com
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} /> Shop No. 12, Main Market
            </li>
          </ul>
        </div>

        {/* Column 4: Social */}
        <div>
          <h4 className="font-bold mb-4">Follow Us</h4>
          <div className="flex gap-4">
            <a href="#" className="bg-gray-700 p-2 rounded-full hover:bg-blue-600"><Facebook size={20}/></a>
            <a href="#" className="bg-gray-700 p-2 rounded-full hover:bg-pink-600"><Instagram size={20}/></a>
            <a href="#" className="bg-gray-700 p-2 rounded-full hover:bg-blue-400"><Twitter size={20}/></a>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
        © 2024 LappyDekho. All rights reserved.
      </div>
    </footer>
  );
}