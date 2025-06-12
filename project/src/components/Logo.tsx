import React from 'react';
import { Stethoscope } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-3 group">
      <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-lg transform group-hover:scale-105 transition-transform duration-300">
        <Stethoscope className="h-7 w-7 text-white" />
      </div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent">メドナビAI</h1>
    </div>
  );
};

export default Logo;