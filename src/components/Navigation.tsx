import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  // Only show navigation on the main feed page
  if (location.pathname === '/admin') return null;
  
  return (
    <nav className="fixed bottom-0 w-full bg-black border-t border-gray-800 z-50">
      <div className="flex justify-center items-center py-3">
        <Link to="/" className="flex flex-col items-center text-primary">
          <Home size={24} />
          <span className="text-xs mt-1">Feed</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;