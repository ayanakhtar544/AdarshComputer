"use client";
export const dynamic = "force-dynamic";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Laptop, Mail, Lock, ArrowRight, AlertCircle, Loader2, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, user, loading: authLoading } = useAuth();
  
  const [isLoginView, setIsLoginView] = useState(true); // True = Login, False = Signup
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Agar user pehle se login hai, toh usko seedha Home Page par bhej do
  if (user && !authLoading) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLoginView) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      // Success hone par Home Page par bhej do
      router.push('/');
    } catch (err) {
      console.error("Auth Error:", err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] font-sans selection:bg-red-600 selection:text-white">
      
      {/* Left Side Branding */}
      <div className="hidden md:flex w-1/2 bg-slate-950 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-600/20 to-transparent pointer-events-none"></div>
        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="bg-red-600 text-white p-3 rounded-xl"><Laptop size={28} /></div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Ad<span className="text-red-500">Comp</span></h1>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white mb-6 tracking-tight leading-tight">Your Premium<br/>Tech Destination</h2>
          <p className="text-slate-400 font-medium max-w-md leading-relaxed">Join thousands of happy customers. Create an account to track your orders, save wishlists, and get exclusive discounts.</p>
        </div>
        <div className="relative z-10 text-xs font-bold text-slate-600 uppercase tracking-widest">
          © {new Date().getFullYear()} LappyDekho All Rights Reserved.
        </div>
      </div>

      {/* Right Side Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        {/* Mobile Logo */}
        <Link href="/" className="md:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="bg-red-600 text-white p-2 rounded-lg"><Laptop size={20} /></div>
          <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Rana<span className="text-red-600">Comp.</span></h1>
        </Link>

        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 mt-12 md:mt-0">
          
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
             <button 
               onClick={() => { setIsLoginView(true); setError(''); }}
               className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${isLoginView ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Sign In
             </button>
             <button 
               onClick={() => { setIsLoginView(false); setError(''); }}
               className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${!isLoginView ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               Create Account
             </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
               {isLoginView ? 'Welcome Back' : 'Join Rana Computers'}
            </h2>
            <p className="text-sm font-medium text-slate-500">
               {isLoginView ? 'Sign in to access your account and orders.' : 'Fill in your details to create a new account.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 mb-6">
              <AlertCircle size={18} className="flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {!isLoginView && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><UserIcon size={18} className="text-slate-400" /></div>
                  <input type="text" required={!isLoginView} value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 block pl-11 p-3.5 outline-none font-medium" placeholder="John Doe" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={18} className="text-slate-400" /></div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 block pl-11 p-3.5 outline-none font-medium" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-slate-400" /></div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 block pl-11 p-3.5 outline-none font-medium" placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 text-white bg-slate-900 hover:bg-red-600 font-black rounded-xl text-sm px-5 py-4 uppercase tracking-widest mt-6 shadow-lg disabled:opacity-70 transition-colors">
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <>{isLoginView ? 'Sign In' : 'Create Account'} <ArrowRight size={18} /></>}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}