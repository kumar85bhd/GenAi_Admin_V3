import React from 'react';
import { motion } from 'framer-motion';

export type RobotVariant = 'idle' | 'blinking' | 'talking' | 'scanning' | 'glitch' | 'wave' | 'hover' | 'hologram' | 'charging' | 'alert';

interface RobotAnimationProps {
  scale?: number;
  className?: string;
  color?: string; // e.g., 'indigo', 'cyan', 'fuchsia', 'orange', 'emerald'
  variant?: RobotVariant;
}

const RobotAnimation: React.FC<RobotAnimationProps> = ({ scale = 0.5, className = '', color = 'indigo', variant = 'idle' }) => {
  
  // Color mapping for different parts
  const getColorStyles = (color: string) => {
    const styles: Record<string, { aura: string, eye: string, eyeShadow: string, chest: string, icon1: string, icon2: string, icon3: string }> = {
      'indigo': { 
        aura: 'bg-indigo-500/10 dark:bg-indigo-500/20', 
        eye: 'border-cyan-400', 
        eyeShadow: 'drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]',
        chest: 'bg-cyan-400',
        icon1: 'text-indigo-400 border-indigo-500/30 shadow-indigo-500/20',
        icon2: 'text-purple-400 border-purple-500/30 shadow-purple-500/20',
        icon3: 'text-cyan-400 border-cyan-500/30 shadow-cyan-500/20'
      },
      'fuchsia': { 
        aura: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/20', 
        eye: 'border-fuchsia-400', 
        eyeShadow: 'drop-shadow-[0_0_10px_rgba(232,121,249,0.8)]',
        chest: 'bg-fuchsia-400',
        icon1: 'text-fuchsia-400 border-fuchsia-500/30 shadow-fuchsia-500/20',
        icon2: 'text-pink-400 border-pink-500/30 shadow-pink-500/20',
        icon3: 'text-purple-400 border-purple-500/30 shadow-purple-500/20'
      },
      'emerald': { 
        aura: 'bg-emerald-500/10 dark:bg-emerald-500/20', 
        eye: 'border-emerald-400', 
        eyeShadow: 'drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]',
        chest: 'bg-emerald-400',
        icon1: 'text-emerald-400 border-emerald-500/30 shadow-emerald-500/20',
        icon2: 'text-teal-400 border-teal-500/30 shadow-teal-500/20',
        icon3: 'text-green-400 border-green-500/30 shadow-green-500/20'
      },
      'orange': { 
        aura: 'bg-orange-500/10 dark:bg-orange-500/20', 
        eye: 'border-orange-400', 
        eyeShadow: 'drop-shadow-[0_0_10px_rgba(251,146,60,0.8)]',
        chest: 'bg-orange-400',
        icon1: 'text-orange-400 border-orange-500/30 shadow-orange-500/20',
        icon2: 'text-amber-400 border-amber-500/30 shadow-amber-500/20',
        icon3: 'text-red-400 border-red-500/30 shadow-red-500/20'
      },
      'blue': { 
        aura: 'bg-blue-500/10 dark:bg-blue-500/20', 
        eye: 'border-blue-400', 
        eyeShadow: 'drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]',
        chest: 'bg-blue-400',
        icon1: 'text-blue-400 border-blue-500/30 shadow-blue-500/20',
        icon2: 'text-indigo-400 border-indigo-500/30 shadow-indigo-500/20',
        icon3: 'text-sky-400 border-sky-500/30 shadow-sky-500/20'
      },
      'pink': { 
        aura: 'bg-pink-500/10 dark:bg-pink-500/20', 
        eye: 'border-pink-400', 
        eyeShadow: 'drop-shadow-[0_0_10px_rgba(244,114,182,0.8)]',
        chest: 'bg-pink-400',
        icon1: 'text-pink-400 border-pink-500/30 shadow-pink-500/20',
        icon2: 'text-rose-400 border-rose-500/30 shadow-rose-500/20',
        icon3: 'text-fuchsia-400 border-fuchsia-500/30 shadow-fuchsia-500/20'
      },
    };
    return styles[color] || styles['indigo'];
  };

  const styles = getColorStyles(color);

  // Animation Variants
  const getEyeAnimation = () => {
    switch (variant) {
      case 'blinking':
        return { scaleY: [1, 0.1, 1], transition: { duration: 0.3, repeat: Infinity, repeatDelay: 4 } };
      case 'scanning':
        return { opacity: [0.5, 1, 0.5], transition: { duration: 1, repeat: Infinity } }; // Simple scan effect
      default:
        return { scaleY: 1, transition: { duration: 0.5, delay: 0.5 } };
    }
  };

  const getMouthAnimation = () => {
    switch (variant) {
      case 'talking':
        return { height: [4, 8, 4], transition: { duration: 0.4, repeat: Infinity } };
      default:
        return {};
    }
  };

  const getBodyAnimation = () => {
    switch (variant) {
      case 'hover':
        return { rotate: 360, transition: { duration: 12, repeat: Infinity, ease: "linear" } };
      case 'wave':
        return { rotate: [-5, 5, -5], transition: { duration: 1.5, repeat: Infinity } };
      case 'alert':
        return { rotate: [-8, 8, -8], transition: { duration: 0.4, repeat: Infinity, repeatDelay: 2 } };
      case 'glitch':
        return { x: [-2, 2, -2], opacity: [1, 0.6, 1], transition: { duration: 0.2, repeat: Infinity } };
      case 'hologram':
        return { opacity: [0.8, 1, 0.8], y: [-2, 2, -2], transition: { duration: 1.2, repeat: Infinity } };
      default:
        return { y: [-10, 10, -10], transition: { duration: 6, repeat: Infinity, ease: "easeInOut" } };
    }
  };

  const getChestAnimation = () => {
    switch (variant) {
      case 'charging':
        return { scale: [1, 1.4, 1], transition: { duration: 1, repeat: Infinity } };
      default:
        return {};
    }
  };

  const isHologram = variant === 'hologram';

  return (
    <div className={`hidden md:flex items-center justify-center relative ${className}`}>
      {/* Glowing Aura */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute w-56 h-56 rounded-full blur-[50px] ${styles.aura}`}
      />
      
      {/* Robot Composition */}
      <motion.div 
        animate={getBodyAnimation()}
        className={`relative w-56 h-56 flex items-center justify-center ${isHologram ? 'mix-blend-screen' : ''}`}
      >
        {/* Robot Character */}
        <div className="relative z-10 flex flex-col items-center transform" style={{ transform: `scale(${scale})` }}>
          {/* Head */}
          <div className="relative w-40 h-32 bg-gradient-to-b from-slate-100 to-slate-300 rounded-[2.5rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] border border-slate-100 flex items-center justify-center z-20">
            {/* Face Screen */}
            <div className="w-[88%] h-[82%] bg-slate-950 rounded-[2rem] relative overflow-hidden shadow-inner flex flex-col items-center justify-center border border-slate-800">
               {/* Screen Gloss */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-b-full opacity-50" />
               
               {/* Eyes */}
               <div className="flex gap-6 mb-2">
                 <motion.div 
                   initial={{ scaleY: 0.1 }}
                   animate={getEyeAnimation()}
                   className={`w-8 h-4 border-t-[5px] rounded-t-full ${styles.eye} ${styles.eyeShadow}`}
                 />
                 <motion.div 
                   initial={{ scaleY: 0.1 }}
                   animate={getEyeAnimation()}
                   className={`w-8 h-4 border-t-[5px] rounded-t-full ${styles.eye} ${styles.eyeShadow}`}
                 />
               </div>
               
               {/* Scanning Beam (Only for scanning variant) */}
               {variant === 'scanning' && (
                 <motion.div
                   animate={{ x: [-60, 60, -60] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                   className="absolute w-2 h-full bg-cyan-400/50 blur-md top-0"
                 />
               )}

               {/* Smile */}
               <motion.div 
                  animate={getMouthAnimation()}
                  className={`w-4 h-2 border-b-[3px] rounded-b-full opacity-80 ${styles.eye}`}
               />
            </div>

            {/* Ears */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-6 h-16 bg-gradient-to-r from-slate-300 to-slate-100 rounded-2xl shadow-md -z-10 border-l border-slate-300" />
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-6 h-16 bg-gradient-to-l from-slate-300 to-slate-100 rounded-2xl shadow-md -z-10 border-r border-slate-300" />
          </div>

          {/* Body */}
          <div className="relative -mt-4 w-28 h-20 bg-gradient-to-b from-slate-200 to-slate-400 rounded-[2rem] shadow-xl z-10 flex items-center justify-center border-t border-slate-300">
             <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-600">
                <motion.div 
                  animate={getChestAnimation()}
                  className={`w-4 h-4 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] ${variant !== 'charging' ? 'animate-pulse' : ''} ${styles.chest}`} 
                />
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RobotAnimation;
