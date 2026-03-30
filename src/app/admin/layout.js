"use client";
export const dynamic = "force-dynamic";

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, PackagePlus, ShoppingBag, LogOut, Monitor, 
  Menu, X, Package, BookOpen, FileText, Bell, Search, 
  ChevronRight, ChevronLeft, Settings, User, ShieldAlert,
  Home, Clock, Info, CheckCircle2, LifeBuoy, Users,
} from 'lucide-react';

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================
const MAIN_NAV_ITEMS = [
  { name: 'Dashboard Overview', shortName: 'Home', icon: LayoutDashboard, href: '/admin', desc: 'Analytics & Stats' },
  { name: 'All Products', shortName: 'Items', icon: Package, href: '/admin/products', desc: 'Inventory Control' },
  { name: 'Add Product', shortName: 'Add', icon: PackagePlus, href: '/admin/add-product', desc: 'List new item' },
  { name: 'Order Mgmt', shortName: 'Orders', icon: ShoppingBag, href: '/admin/orders', desc: 'Track & Process' },
];

const EXTRA_TOOLS = [
  { name: 'Invoice Generator', icon: FileText, href: '/admin/invoice', desc: 'Create PDF Bills' },
  { name: 'Khatabook', icon: BookOpen, href: '/admin/khatabook', desc: 'Ledger & Dues' },
  { name: 'Customers Database', icon: Users, href: '/admin/customers', desc: 'Registered Users' },
];

const DUMMY_NOTIFICATIONS = [
  { id: 1, text: "New order #ORD-892 placed.", time: "2 mins ago", type: "success" },
  { id: 2, text: "Stock running low for HP EliteBook.", time: "1 hour ago", type: "warning" },
  { id: 3, text: "System update scheduled at 2 AM.", time: "5 hours ago", type: "info" },
];

// Dummy User for Unlocked Dev Mode
const DUMMY_USER = {
  displayName: "Admin (Dev Mode)",
  email: "lappydekho@gmail.com"
};

// ============================================================================
// 2. SUB-CompONENTS
// ============================================================================

// --- A. Dynamic Breadcrumbs ---
const Breadcrumbs = ({ pathname }) => {
  const getPathNames = () => {
    if (pathname === '/admin') return ['Dashboard Overview'];
    if (pathname.includes('/admin/products')) return ['Inventory', 'All Products'];
    if (pathname.includes('/admin/add-product')) return ['Inventory', 'Add New Product'];
    if (pathname.includes('/admin/orders')) return ['Sales', 'Order Management'];
    if (pathname.includes('/admin/invoice')) return ['Tools', 'Invoice Generator'];
    if (pathname.includes('/admin/khatabook')) return ['Tools', 'Khatabook Ledger'];
    return ['Admin Control Panel'];
  };

  const paths = getPathNames();

  return (
    <div className="hidden md:flex flex-col">
      <h2 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight capitalize">
        {paths[paths.length - 1]}
      </h2>
      <div className="flex items-center gap-2 text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
        <span className="flex items-center gap-1 hover:text-red-600 transition cursor-pointer"><Home size={12}/> Admin</span>
        {paths.map((p, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight size={12} className="text-slate-300"/>
            <span className={idx === paths.length - 1 ? "text-red-600" : ""}>{p}</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// --- B. Desktop Sidebar (Collapsible) ---
const DesktopSidebar = ({ pathname, isCollapsed, setIsCollapsed }) => (
  <aside 
    className={`hidden md:flex flex-col bg-slate-900 text-slate-300 shadow-[20px_0_40px_rgba(0,0,0,0.05)] fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out border-r border-slate-800 print:hidden ${isCollapsed ? 'w-[88px]' : 'w-[280px]'}`}
  >
    <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/50 relative">
       <div className={`flex items-center gap-3 overflow-hidden transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-full'}`}>
          <div className="bg-red-600 p-2 rounded-xl text-white shadow-lg shadow-red-600/20 flex-shrink-0">
             <Monitor size={20} strokeWidth={2.5}/>
          </div>
          <div className="flex flex-col whitespace-nowrap">
             <h2 className="text-xl font-black tracking-tighter text-white leading-none">LappyDekho<span className="text-red-600">.</span></h2>
             <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">Admin Panel</p>
          </div>
       </div>
       
       <button 
         onClick={() => setIsCollapsed(!isCollapsed)} 
         className={`absolute right-[-14px] top-6 bg-slate-800 text-white p-1.5 rounded-full border-4 border-[#F4F6F9] hover:bg-red-600 transition-colors z-50 shadow-sm ${isCollapsed ? 'rotate-180 right-6 top-6 border-none bg-transparent hover:bg-slate-800' : ''}`}
       >
          <ChevronLeft size={16}/>
       </button>
    </div>

    <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden px-4">
      {!isCollapsed && <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 mt-2">Main Menu</p>}
      
      {MAIN_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        return (
          <Link 
            key={item.name} 
            href={item.href}
            title={isCollapsed ? item.name : ""}
            className={`group relative flex items-center gap-4 py-3 rounded-xl font-bold transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-slate-800 hover:text-white text-slate-400'}`}
          >
            {isActive && !isCollapsed && <motion.div layoutId="activeNavDesk" className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />}
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`relative z-10 transition-colors flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-400'}`}/>
            
            {!isCollapsed && (
               <div className="flex flex-col relative z-10 whitespace-nowrap">
                 <span className="text-sm tracking-wide">{item.name}</span>
                 <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-red-200' : 'text-slate-500 group-hover:text-slate-400'}`}>{item.desc}</span>
               </div>
            )}
          </Link>
        );
      })}

      {!isCollapsed && <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 mt-8">Business Tools</p>}
      {isCollapsed && <div className="w-full h-px bg-slate-800 my-4"></div>}

      {EXTRA_TOOLS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        return (
          <Link 
            key={item.name} 
            href={item.href}
            title={isCollapsed ? item.name : ""}
            className={`group relative flex items-center gap-4 py-3 rounded-xl font-bold transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${isActive ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'hover:bg-slate-800 hover:text-white text-slate-400'}`}
          >
            {isActive && !isCollapsed && <motion.div layoutId="activeNavDesk" className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />}
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`relative z-10 transition-colors flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-400'}`}/>
            
            {!isCollapsed && (
               <div className="flex flex-col relative z-10 whitespace-nowrap">
                 <span className="text-sm tracking-wide">{item.name}</span>
               </div>
            )}
          </Link>
        );
      })}
    </nav>

    <div className={`p-4 border-t border-slate-800 bg-slate-950/30 transition-all ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
      {!isCollapsed ? (
         <div className="flex items-center gap-3 mb-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 w-full overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex flex-shrink-0 items-center justify-center text-white font-black border border-slate-600 shadow-inner">
               A
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-xs font-bold text-white truncate">{DUMMY_USER.displayName}</p>
               <p className="text-[10px] text-slate-400 truncate">{DUMMY_USER.email}</p>
            </div>
         </div>
      ) : (
         <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-black border border-slate-600 shadow-inner mb-4 cursor-pointer hover:bg-slate-600 transition" title={DUMMY_USER.email}>
            A
         </div>
      )}

      <Link 
        href="/"
        title={isCollapsed ? "Back to Store" : ""}
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-800 hover:text-white transition-all border border-slate-700 hover:border-slate-600 shadow-sm ${isCollapsed ? 'px-0' : 'px-4'}`}
      >
        <LogOut size={16}/> {!isCollapsed && "Exit Admin"}
      </Link>
    </div>
  </aside>
);

// --- C. Desktop Header (with Dropdowns) ---
const DesktopHeader = ({ pathname }) => {
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef();
  const profileRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="hidden md:flex h-20 bg-white/70 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-gray-200/80 items-center justify-between px-8 sticky top-0 z-40 print:hidden transition-all">
       
       <Breadcrumbs pathname={pathname} />

       <div className="flex items-center gap-5 lg:gap-8">
          <div className="hidden lg:flex items-center relative w-64 xl:w-80 group">
             
          </div>

          <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>

          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => {setShowNotif(!showNotif); setShowProfile(false);}}
              className={`relative p-2.5 rounded-full transition-all duration-300 border ${showNotif ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
               <Bell size={20} />
               <span className="absolute top-0 right-0 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            
            <AnimatePresence>
              {showNotif && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 origin-top-right"
                >
                  <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
                     <h3 className="text-white font-bold text-sm">Notifications</h3>
                     <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">3 New</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                     {DUMMY_NOTIFICATIONS.map(notif => (
                        <div key={notif.id} className="p-4 border-b border-gray-50 hover:bg-slate-50 transition cursor-pointer flex gap-3 items-start">
                           <div className={`p-2 rounded-full flex-shrink-0 mt-0.5 ${notif.type === 'success' ? 'bg-green-100 text-green-600' : notif.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                              {notif.type === 'success' ? <CheckCircle2 size={14}/> : notif.type === 'warning' ? <ShieldAlert size={14}/> : <Info size={14}/>}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-800 leading-tight mb-1">{notif.text}</p>
                              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock size={10}/> {notif.time}</p>
                           </div>
                        </div>
                     ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={profileRef}>
             <button 
               onClick={() => {setShowProfile(!showProfile); setShowNotif(false);}}
               className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-full shadow-sm hover:shadow transition-all"
             >
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-inner">
                   A
                </div>
                <div className="flex flex-col text-left hidden lg:flex">
                   <span className="text-xs font-bold text-slate-900 leading-none mb-0.5">Admin</span>
                   <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Settings</span>
                </div>
             </button>

             <AnimatePresence>
              {showProfile && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50 origin-top-right"
                >
                  <div className="p-4 border-b border-gray-100 bg-slate-50/50">
                     <p className="text-sm font-black text-slate-900 truncate">{DUMMY_USER.displayName}</p>
                     <p className="text-[10px] font-medium text-slate-500 truncate mt-0.5">{DUMMY_USER.email}</p>
                  </div>
                  <div className="p-2 border-t border-gray-100">
                     <Link href="/" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition">
                        <LogOut size={16}/> Exit Admin
                     </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
       </div>
    </header>
  );
};

// --- D. Mobile Top Header ---
const MobileHeader = ({ setIsDrawerOpen }) => (
  <header className="md:hidden bg-slate-900 text-white h-[72px] sticky top-0 z-40 flex justify-between items-center px-5 shadow-lg print:hidden">
     <div className="flex items-center gap-4">
        <button onClick={() => setIsDrawerOpen(true)} className="p-2 bg-slate-800 rounded-xl hover:bg-red-600 active:scale-95 transition text-slate-200 hover:text-white">
           <Menu size={22} strokeWidth={2.5} />
        </button>
        <div className="flex items-center gap-2">
           <div className="bg-red-600 p-1.5 rounded-lg shadow-inner"><Monitor size={18} strokeWidth={2.5}/></div>
           <h1 className="font-black text-xl tracking-tighter">LappyDekho</h1>
        </div>
     </div>
     <div className="relative p-2 bg-slate-800 rounded-full text-slate-300">
        <Bell size={20} />
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-800"></span>
     </div>
  </header>
);

// --- E. Mobile Hamburger Drawer ---
const MobileDrawer = ({ isDrawerOpen, setIsDrawerOpen, pathname }) => (
  <AnimatePresence>
    {isDrawerOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden print:hidden"
        />
        <motion.div 
          initial={{ x: "-100%", borderTopRightRadius: "50px", borderBottomRightRadius: "50px" }} 
          animate={{ x: 0, borderTopRightRadius: "0px", borderBottomRightRadius: "0px" }} 
          exit={{ x: "-100%", borderTopRightRadius: "50px", borderBottomRightRadius: "50px" }} 
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className="fixed inset-y-0 left-0 w-[80%] max-w-[320px] bg-white z-[70] shadow-2xl flex flex-col md:hidden print:hidden"
        >
          <div className="p-6 bg-slate-900 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
             <div className="flex justify-between items-start relative z-10 mb-6">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-slate-900 font-black text-2xl border-4 border-slate-700 shadow-xl">
                   A
                </div>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition"><X size={20}/></button>
             </div>
             <div className="relative z-10">
                <h2 className="font-black text-lg leading-tight truncate">{DUMMY_USER.displayName}</h2>
                <p className="text-xs text-slate-400 font-medium truncate mt-1">{DUMMY_USER.email}</p>
             </div>
          </div>

          <nav className="flex-1 p-5 space-y-1 overflow-y-auto">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 mt-2">Tools & Features</p>
             
             {EXTRA_TOOLS.map(item => {
               const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
               return (
                 <Link 
                   key={item.name} 
                   href={item.href} 
                   onClick={() => setIsDrawerOpen(false)} 
                   className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${isActive ? 'bg-red-50 text-red-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                 >
                   <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-red-600' : 'text-slate-400'}/>
                   {item.name}
                 </Link>
               );
             })}
             
             <div className="my-6 border-t border-gray-100"></div>
             
             <Link href="/" className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition mt-2">
               <LogOut size={20} /> Exit Admin
             </Link>
          </nav>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// --- F. Mobile Bottom Navigation ---
const MobileBottomNav = ({ pathname }) => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/80 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-40 pb-safe print:hidden">
    <div className="flex justify-around items-center px-1 py-1.5 relative">
      {MAIN_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
        return (
          <Link key={item.shortName} href={item.href} className="flex flex-col items-center gap-1 p-2 min-w-[64px] relative">
            {isActive && (
               <motion.div layoutId="mobileNavActive" className="absolute -top-1.5 w-10 h-1 bg-red-600 rounded-b-full shadow-[0_2px_8px_rgba(220,38,38,0.5)]" />
            )}
            <div className={`p-1.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-red-50 text-red-600 scale-110 shadow-inner' : 'text-slate-500 hover:bg-slate-50'}`}>
               <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-red-600' : 'text-slate-400'}`}>
               {item.shortName}
            </span>
          </Link>
        );
      })}
    </div>
  </nav>
);

// ============================================================================
// 3. MAIN ADMIN LAYOUT CompONENT (Unlocked Dev Mode)
// ============================================================================

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 🚨 NO MORE AUTH CHECKS!
  // The layout will render immediately without checking Firebase or User state.

  return (
    <div className="min-h-screen bg-[#F4F6F9] font-sans flex flex-col md:flex-row overflow-hidden selection:bg-red-600 selection:text-white">
      
      {/* 1. Desktop Sidebar */}
      <DesktopSidebar 
        pathname={pathname} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* 2. Mobile Header */}
      <MobileHeader setIsDrawerOpen={setIsDrawerOpen} />

      {/* 3. Mobile Drawer */}
      <MobileDrawer 
        isDrawerOpen={isDrawerOpen} 
        setIsDrawerOpen={setIsDrawerOpen} 
        pathname={pathname} 
      />

      {/* 4. Main Content Wrapper */}
      <div className={`flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300 ease-in-out print:ml-0 print:h-auto print:overflow-visible ${isSidebarCollapsed ? 'md:ml-[88px]' : 'md:ml-[280px]'}`}>
        
        {/* Desktop Top Header */}
        <DesktopHeader pathname={pathname} />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-10 pb-28 md:pb-10 custom-scrollbar relative z-0 print:p-0 print:overflow-visible bg-[#F4F6F9]">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full max-w-[1600px] mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 5. Mobile Bottom Dock */}
      <MobileBottomNav pathname={pathname} />

    </div>
  );
}