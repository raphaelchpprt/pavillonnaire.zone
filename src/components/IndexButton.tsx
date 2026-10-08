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
      <span aria-hidden="true" className="text-lg leading-none font-bold">
        c
      </span>
    </button>
  );
};
