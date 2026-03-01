import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - 10; // 10px offset
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 10;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 10;
          break;
      }
      setCoords({ top, left });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  return (
    <>
      <div 
        ref={triggerRef}
        className={`inline-flex ${className}`}
        onMouseEnter={() => { setIsVisible(true); updatePosition(); }}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div 
          className="fixed z-[9999] px-3 py-1.5 text-xs font-bold tracking-wide text-white bg-slate-900 dark:bg-white dark:text-black rounded-md shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150 border border-slate-800 dark:border-slate-200"
          style={{
            top: coords.top,
            left: coords.left,
            transform: `translate(${position === 'left' || position === 'right' ? (position === 'left' ? '-100%, -50%' : '0, -50%') : '-50%, ' + (position === 'top' ? '-100%' : '0')})`
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
};
