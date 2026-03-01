export interface CategoryPalette {
  bg: string;
  text: string;
  border: string;
  shadow: string;
  gradient: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
  indicator: string;
  glow: string;
}

export const highlightPalettes: CategoryPalette[] = [
  {
    bg: 'bg-indigo-500/10', text: 'text-indigo-500 dark:text-indigo-400', border: 'group-hover:border-indigo-500/50', shadow: 'group-hover:shadow-indigo-500/20', gradient: 'from-indigo-500 to-blue-600',
    activeBg: 'bg-indigo-500/10', activeText: 'text-indigo-500 dark:text-indigo-400', activeBorder: 'border-indigo-500/50', indicator: 'bg-indigo-500', glow: 'shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)]'
  },
  {
    bg: 'bg-violet-500/10', text: 'text-violet-500 dark:text-violet-400', border: 'group-hover:border-violet-500/50', shadow: 'group-hover:shadow-violet-500/20', gradient: 'from-violet-500 to-purple-600',
    activeBg: 'bg-violet-500/10', activeText: 'text-violet-500 dark:text-violet-400', activeBorder: 'border-violet-500/50', indicator: 'bg-violet-500', glow: 'shadow-[0_0_20px_-5px_rgba(139,92,246,0.4)]'
  },
  {
    bg: 'bg-cyan-500/10', text: 'text-cyan-500 dark:text-cyan-400', border: 'group-hover:border-cyan-500/50', shadow: 'group-hover:shadow-cyan-500/20', gradient: 'from-cyan-400 to-blue-500',
    activeBg: 'bg-cyan-500/10', activeText: 'text-cyan-500 dark:text-cyan-400', activeBorder: 'border-cyan-500/50', indicator: 'bg-cyan-500', glow: 'shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]'
  },
  {
    bg: 'bg-teal-500/10', text: 'text-teal-500 dark:text-teal-400', border: 'group-hover:border-teal-500/50', shadow: 'group-hover:shadow-teal-500/20', gradient: 'from-teal-400 to-emerald-500',
    activeBg: 'bg-teal-500/10', activeText: 'text-teal-500 dark:text-teal-400', activeBorder: 'border-teal-500/50', indicator: 'bg-teal-500', glow: 'shadow-[0_0_20px_-5px_rgba(20,184,166,0.4)]'
  },
  {
    bg: 'bg-amber-500/10', text: 'text-amber-500 dark:text-amber-400', border: 'group-hover:border-amber-500/50', shadow: 'group-hover:shadow-amber-500/20', gradient: 'from-amber-400 to-orange-500',
    activeBg: 'bg-amber-500/10', activeText: 'text-amber-500 dark:text-amber-400', activeBorder: 'border-amber-500/50', indicator: 'bg-amber-500', glow: 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]'
  },
  {
    bg: 'bg-red-500/10', text: 'text-red-500 dark:text-red-400', border: 'group-hover:border-red-500/50', shadow: 'group-hover:shadow-red-500/20', gradient: 'from-red-500 to-rose-600',
    activeBg: 'bg-red-500/10', activeText: 'text-red-500 dark:text-red-400', activeBorder: 'border-red-500/50', indicator: 'bg-red-500', glow: 'shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)]'
  },
  {
    bg: 'bg-lime-500/10', text: 'text-lime-500 dark:text-lime-400', border: 'group-hover:border-lime-500/50', shadow: 'group-hover:shadow-lime-500/20', gradient: 'from-lime-400 to-green-500',
    activeBg: 'bg-lime-500/10', activeText: 'text-lime-500 dark:text-lime-400', activeBorder: 'border-lime-500/50', indicator: 'bg-lime-500', glow: 'shadow-[0_0_20px_-5px_rgba(132,204,22,0.4)]'
  },
  {
    bg: 'bg-pink-500/10', text: 'text-pink-500 dark:text-pink-400', border: 'group-hover:border-pink-500/50', shadow: 'group-hover:shadow-pink-500/20', gradient: 'from-pink-400 to-rose-500',
    activeBg: 'bg-pink-500/10', activeText: 'text-pink-500 dark:text-pink-400', activeBorder: 'border-pink-500/50', indicator: 'bg-pink-500', glow: 'shadow-[0_0_20px_-5px_rgba(236,72,153,0.4)]'
  },
  {
    bg: 'bg-emerald-500/10', text: 'text-emerald-500 dark:text-emerald-400', border: 'group-hover:border-emerald-500/50', shadow: 'group-hover:shadow-emerald-500/20', gradient: 'from-emerald-400 to-teal-500',
    activeBg: 'bg-emerald-500/10', activeText: 'text-emerald-500 dark:text-emerald-400', activeBorder: 'border-emerald-500/50', indicator: 'bg-emerald-500', glow: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]'
  },
  {
    bg: 'bg-orange-500/10', text: 'text-orange-500 dark:text-orange-400', border: 'group-hover:border-orange-500/50', shadow: 'group-hover:shadow-orange-500/20', gradient: 'from-orange-400 to-amber-500',
    activeBg: 'bg-orange-500/10', activeText: 'text-orange-500 dark:text-orange-400', activeBorder: 'border-orange-500/50', indicator: 'bg-orange-500', glow: 'shadow-[0_0_20px_-5px_rgba(249,115,22,0.4)]'
  },
  {
    bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-500 dark:text-fuchsia-400', border: 'group-hover:border-fuchsia-500/50', shadow: 'group-hover:shadow-fuchsia-500/20', gradient: 'from-fuchsia-400 to-purple-500',
    activeBg: 'bg-fuchsia-500/10', activeText: 'text-fuchsia-500 dark:text-fuchsia-400', activeBorder: 'border-fuchsia-500/50', indicator: 'bg-fuchsia-500', glow: 'shadow-[0_0_20px_-5px_rgba(217,70,239,0.4)]'
  },
  {
    bg: 'bg-sky-500/10', text: 'text-sky-500 dark:text-sky-400', border: 'group-hover:border-sky-500/50', shadow: 'group-hover:shadow-sky-500/20', gradient: 'from-sky-400 to-blue-500',
    activeBg: 'bg-sky-500/10', activeText: 'text-sky-500 dark:text-sky-400', activeBorder: 'border-sky-500/50', indicator: 'bg-sky-500', glow: 'shadow-[0_0_20px_-5px_rgba(14,165,233,0.4)]'
  },
  {
    bg: 'bg-rose-500/10', text: 'text-rose-500 dark:text-rose-400', border: 'group-hover:border-rose-500/50', shadow: 'group-hover:shadow-rose-500/20', gradient: 'from-rose-400 to-red-500',
    activeBg: 'bg-rose-500/10', activeText: 'text-rose-500 dark:text-rose-400', activeBorder: 'border-rose-500/50', indicator: 'bg-rose-500', glow: 'shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)]'
  },
  {
    bg: 'bg-yellow-500/10', text: 'text-yellow-500 dark:text-yellow-400', border: 'group-hover:border-yellow-500/50', shadow: 'group-hover:shadow-yellow-500/20', gradient: 'from-yellow-400 to-amber-500',
    activeBg: 'bg-yellow-500/10', activeText: 'text-yellow-500 dark:text-yellow-400', activeBorder: 'border-yellow-500/50', indicator: 'bg-yellow-500', glow: 'shadow-[0_0_20px_-5px_rgba(234,179,8,0.4)]'
  },
  {
    bg: 'bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400', border: 'group-hover:border-blue-500/50', shadow: 'group-hover:shadow-blue-500/20', gradient: 'from-blue-500 to-indigo-600',
    activeBg: 'bg-blue-500/10', activeText: 'text-blue-500 dark:text-blue-400', activeBorder: 'border-blue-500/50', indicator: 'bg-blue-500', glow: 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)]'
  },
  {
    bg: 'bg-slate-500/10', text: 'text-slate-500 dark:text-slate-400', border: 'group-hover:border-slate-500/50', shadow: 'group-hover:shadow-slate-500/20', gradient: 'from-slate-400 to-slate-600',
    activeBg: 'bg-slate-500/10', activeText: 'text-slate-500 dark:text-slate-400', activeBorder: 'border-slate-500/50', indicator: 'bg-slate-500', glow: 'shadow-[0_0_20px_-5px_rgba(100,116,139,0.4)]'
  }
];

const categoryColorMap = new Map<string, number>();
let nextColorIndex = 1; // Start from 1, reserve 0 for default/home

export const getCategoryStyles = (category: string | null): CategoryPalette => {
  const catStr = (category || '').toLowerCase().trim();
  
  if (!catStr || catStr === 'home' || catStr === 'applications' || catStr === 'favorites') {
    return highlightPalettes[0];
  }

  if (!categoryColorMap.has(catStr)) {
    // Assign next available color, wrapping around if we run out
    // Skip 0 (default) and the last one (slate/gray fallback)
    const maxColors = highlightPalettes.length - 1;
    let index = nextColorIndex;
    if (index >= maxColors) {
        index = 1 + (index % (maxColors - 1));
    }
    categoryColorMap.set(catStr, index);
    nextColorIndex++;
  }

  const index = categoryColorMap.get(catStr)!;
  return highlightPalettes[index];
};
