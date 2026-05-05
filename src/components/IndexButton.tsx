'use client';

import { cn } from '@/utils';
import { FC } from 'react';

type IndexButtonProps = {
  onClick?: () => void;
  className?: string;
};

export const IndexButton: FC<IndexButtonProps> = ({ onClick, className }) => {
  return (
    <button
      id="index-button"
      type="button"
      onClick={onClick}
      aria-label="Ouvrir l'index"
      className={cn(
        'absolute right-6 top-6 z-20 flex h-7 w-7 cursor-pointer items-center justify-center border-[1.5px] border-white text-white mix-blend-difference transition-colors hover:bg-white hover:text-black',
        className,
      )}
    >
      <span aria-hidden="true" className="text-lg leading-none font-bold">
        i
      </span>
    </button>
  );
};
