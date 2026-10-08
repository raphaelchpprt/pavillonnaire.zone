'use client';

import { FC } from 'react';

type IndexButtonProps = {
  onClick: () => void;
};

export const IndexButton: FC<IndexButtonProps> = ({ onClick }) => {
  return (
    <button
      id="index-button"
      type="button"
      onClick={onClick}
      aria-label="Ouvrir l'index"
      className="absolute right-6 top-6 z-20 flex h-7 w-7 cursor-pointer items-center justify-center border-[1.5px] border-white text-white mix-blend-difference transition-colors hover:bg-white hover:text-black"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="h-3.5 w-3.5 fill-current"
      >
        <path d="M6 11 1.2 6.2a2.6 2.6 0 0 1 3.7-3.7L6 3.6l1.1-1.1a2.6 2.6 0 0 1 3.7 3.7Z" />
      </svg>
    </button>
  );
};
