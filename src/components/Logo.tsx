import React from 'react';
import { Stethoscope } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Stethoscope className="h-7 w-7 text-white" />
      <h1 className="text-xl font-bold text-white">メドナビAI</h1>
    </div>
  );
};

export default Logo;