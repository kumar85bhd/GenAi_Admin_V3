import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
};

export default Layout;
