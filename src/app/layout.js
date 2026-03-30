import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext'; // <--- NAYA IMPORT

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Lappy Dekhouter",
  description: "Best Refurbished Store",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* AuthProvider Sabse upar hona chahiye */}
        <AuthProvider> 
          <CartProvider> 
             {children}
             <Toaster position="bottom-center" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}