'use client';

import { cn } from '@/utils';
import { FC, ReactNode, useState } from 'react';

type FilterPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SECTION_TITLES = ['Date', 'Auteur.ices', 'Lieu', 'Type'] as const;

export const FilterPanel: FC<FilterPanelProps> = ({ isOpen, onClose }) => {
  return (
    <aside
      aria-label="Index"
      aria-hidden={!isOpen}
      className={cn(
        'invert-select fixed right-0 top-0 z-40 flex h-full w-[min(100%,360px)] flex-col border border-black bg-white text-black transition-transform duration-200 ease-out',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}
    >
      <header className="flex items-center justify-between px-4 pt-4">
        <h2 className="text-xl font-bold ">index</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer l'index"
          className="cursor-pointer text-xl leading-none"
        >
          &times;
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        {SECTION_TITLES.map((title) => (
          <CollapsibleSection key={title} title={title} />
        ))}
      </div>

      <footer className="px-4 pb-4 text-xl">
        <span className="font-bold">Carte</span>
        <span aria-hidden="true"> ↔ </span>
        <span>Grille</span>
      </footer>
    </aside>
  );
};

type CollapsibleSectionProps = {
  title: string;
  children?: ReactNode;
};

const CollapsibleSection: FC<CollapsibleSectionProps> = ({
  title,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <section className="py-1">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="flex w-full cursor-pointer items-center justify-between text-xl"
      >
        <span className="font-bold">{title}</span>
        <span aria-hidden="true">{isExpanded ? '↑' : '↓'}</span>
      </button>
      {isExpanded && <div className="text-xl font-normal">{children}</div>}
    </section>
  );
};
