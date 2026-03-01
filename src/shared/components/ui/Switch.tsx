import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, label }) => {
  return (
    <button
      onClick={onChange}
      className="group flex items-center justify-between w-full gap-2 focus:outline-none"
      role="switch"
      aria-checked={checked}
    >
      {label && <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{label}</span>}
      <div
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
          checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out ${
            checked ? 'translate-x-4.5' : 'translate-x-1'
          }`}
        />
      </div>
    </button>
  );
};
