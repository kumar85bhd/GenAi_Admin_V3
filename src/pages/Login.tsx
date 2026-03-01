import React, { useState } from 'react';
import { useAuth } from '../shared/context/useAuth';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new FormData();
      formData.append('username', email); // OAuth2PasswordRequestForm expects 'username' field
      formData.append('password', password);
      await login(formData);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/30 dark:bg-indigo-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-emerald-500/30 dark:bg-emerald-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[40rem] h-[40rem] bg-fuchsia-500/30 dark:bg-fuchsia-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div 
        className="glass-panel p-8 rounded-3xl max-w-md w-full z-10 relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your workspace</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6 text-center border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground/80">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground/80">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-background/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="Enter your password"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors shadow-lg shadow-primary/25 mt-6"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
