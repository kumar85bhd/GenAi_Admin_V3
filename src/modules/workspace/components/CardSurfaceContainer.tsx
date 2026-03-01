import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CardSurfaceContainerProps {
  children: React.ReactNode;
  className?: string;
}

const CardSurfaceContainer: React.FC<CardSurfaceContainerProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-fit overflow-hidden ${className}`}
    >
      {/* Highlight Layer */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300"
        animate={{ opacity }}
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.06), transparent 40%)`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default CardSurfaceContainer;
