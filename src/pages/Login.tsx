import React, { useState, useEffect } from 'react';
import { useAuth } from '../shared/context/useAuth';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const Login: React.FC = () => {
  const { ssoLogin } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // In a real production app, we would strictly validate event.origin
      if (event.data?.type === 'SSO_SUCCESS') {
        const { email } = event.data;
        setLoading(true);
        setError('');
        try {
          await ssoLogin(email);
          window.location.href = '/workspace';
        } catch (err: any) {
          setError(err.message || 'SSO Login failed');
          setLoading(false);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [ssoLogin]);

  const handleSSO = () => {
    setError('');
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      '/api/auth/sso-callback', 
      'sso_popup', 
      `width=${width},height=${height},left=${left},top=${top}`
    );
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
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">GenAI Workspace</h1>
          <p className="text-muted-foreground">Secure Enterprise Single Sign-On</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6 text-center border border-destructive/20">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <button 
            onClick={handleSSO}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Globe size={20} className="group-hover:rotate-12 transition-transform" />
            )}
            {loading ? 'Authenticating...' : 'Sign in with SSO'}
          </button>
          
          <p className="text-center text-xs text-muted-foreground px-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
