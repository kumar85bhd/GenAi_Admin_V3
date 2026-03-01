import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LoggedOut: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/30 dark:bg-indigo-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-emerald-500/30 dark:bg-emerald-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[40rem] h-[40rem] bg-fuchsia-500/30 dark:bg-fuchsia-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div 
        className="glass-panel p-10 rounded-3xl max-w-md w-full z-10 relative text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">You are logged out</h1>
        <p className="text-muted-foreground mb-8">Thank you for using the workspace. Have a great day!</p>
        
        <button 
          onClick={() => navigate('/login')}
          className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors shadow-lg shadow-primary/25"
        >
          Sign in again
        </button>
      </motion.div>
    </div>
  );
};

export default LoggedOut;
