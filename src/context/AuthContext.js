"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase'; 
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'; 
import { 
  onAuthStateChanged, signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, signOut, updateProfile,
  GoogleAuthProvider, signInWithPopup 
} from 'firebase/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🚨 BYPASS CHECK: Agar hardcoded admin login hai toh Firebase ka wait mat karo
    const isBypassAdmin = localStorage.getItem('bypassAdmin');
    if (isBypassAdmin === 'true') {
      setUser({ uid: 'boss-admin-123', email: 'admin@gmail.com', displayName: 'Boss Admin' });
      setLoading(false);
      return; // Firebase auth check rok do
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    // 🚨 HARDCODED ADMIN LOGIC (Jugaad)
    if (email === "admin@gmail.com" && password === "admin@123") {
      localStorage.setItem('bypassAdmin', 'true');
      setUser({ uid: 'boss-admin-123', email: 'admin@gmail.com', displayName: 'Boss Admin' });
      toast.success("Welcome Boss! 🚀");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Welcome back! 🚀");
    } catch (error) {
      toast.error("Invalid Email or Password");
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
         uid: userCredential.user.uid,
         name: name,
         email: email,
         role: 'customer',
         createdAt: serverTimestamp()
      });

      setUser({ ...userCredential.user, displayName: name }); 
      toast.success("Account created successfully! 🎉");
    } catch (error) {
      if(error.code === 'auth/email-already-in-use') toast.error("Email already exists!");
      else toast.error(error.message);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
         await setDoc(userRef, {
            uid: result.user.uid,
            name: result.user.displayName,
            email: result.user.email,
            role: 'customer',
            createdAt: serverTimestamp()
         });
      }

      toast.success(`Welcome, ${result.user.displayName}! 🚀`);
    } catch (error) {
      console.error(error);
      toast.error("Google sign-in failed.");
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('bypassAdmin'); // Logout par hardcoded admin hata do
      await signOut(auth);
      setUser(null);
      toast.success("Logged out safely");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loginWithGoogle, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);