import React from 'react';

export const Badge = ({ children, variant = 'default' }) => {
  const styles = {
    default: 'bg-stone-100 text-stone-600',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styles[variant]}`}>
      {children}
    </span>
  );
};
