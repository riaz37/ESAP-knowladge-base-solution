'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { CompanyModal } from './CompanyModal';

interface AddCompanyButtonProps {
  onClick?: () => void;
  onAdd?: (name: string, description: string, contactDatabase: string, parentId?: string) => void;
  parentId?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AddCompanyButton({ 
  onClick, 
  onAdd, 
  parentId, 
  size = 'lg' 
}: AddCompanyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleModalSubmit = (name: string, description: string, contactDatabase: string) => {
    if (onAdd) {
      onAdd(name, description, contactDatabase, parentId);
    }
    setIsModalOpen(false);
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`${sizeClasses[size]} bg-green-600/20 border-2 border-dashed border-green-500/50 
          rounded-full flex items-center justify-center text-green-400
          hover:bg-green-600/30 hover:border-green-400/70 hover:text-green-300
          transition-all duration-300 group relative z-50`}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-green-500/20 opacity-0 
          group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Icon */}
        <Plus className={`${iconSizes[size]} relative z-10`} />
        
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2
          bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 
          group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          {parentId ? 'Add Sub-Company' : 'Add Company'}
        </div>
      </button>

      {/* Modal for direct add */}
      {!onClick && (
        <CompanyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          title={parentId ? 'Add Sub-Company' : 'Create Company'}
        />
      )}
    </>
  );
}