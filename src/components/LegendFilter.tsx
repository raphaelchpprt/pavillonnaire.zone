"use client";

import { FC } from "react";
import { cn } from "@/utils";

import { LAYERS_CONFIG, LayerType } from "@/constants/layers";

interface LegendFilterProps {
  selectedLayers: Set<LayerType>;
  onFilterChange: (layerId: LayerType) => void;
  className?: string;
  /**
   * Carte : pictos en négatif (mix-blend-difference sur le fond de carte).
   * Index : la grille passe map-container en stacking context isolé, le blend
   * ne réagit plus au fond blanc → pictos en noir plein sans blend.
   */
  surface?: "map" | "grid";
}

export const LegendFilter: FC<LegendFilterProps> = ({
  selectedLayers,
  onFilterChange,
  className,
  surface = "map",
}) => {
  const isGrid = surface === "grid";
  return (
    <nav
      aria-label="Filtres par catégorie"
      className={cn(
        "pointer-events-none absolute inset-y-0 left-6 flex flex-col justify-center gap-4",
        className,
      )}
    >
      {LAYERS_CONFIG.map((layer) => {
        const { id, label, Icon, OutlineIcon = Icon } = layer;

        const isSelected = selectedLayers.has(id);

        return (
          <button
            key={id}
            onClick={() => onFilterChange(id)}
            className="group relative flex items-center outline-none pointer-events-auto"
            aria-label={`Filtrer ${label}`}
            aria-pressed={isSelected}
          >
            <div className="relative h-7 w-7">
              <div
                className={cn(
                  "absolute inset-0 z-20 isolation-isolate",
                  !isGrid && "mix-blend-difference",
                  isSelected
                    ? "opacity-0"
                    : "opacity-100 group-hover:[@media(hover:hover)]:opacity-0",
                )}
              >
                <OutlineIcon
                  className={cn(
                    "h-7 w-7",
                    isGrid ? "text-black" : "text-white",
                  )}
                />
              </div>
              <div
                className={cn(
                  "absolute inset-0 z-20 isolation-isolate",
                  isSelected
                    ? "opacity-100"
                    : "opacity-0 group-hover:[@media(hover:hover)]:opacity-100",
                )}
              >
                <Icon className="h-7 w-7 text-white" />
              </div>
            </div>

            <span
              className={cn(
                "absolute left-full z-20 ml-4 flex h-7 items-center whitespace-nowrap border border-white/20 bg-neutral-800/50 px-3 font-serif text-xs tracking-wider text-white backdrop-blur-sm",
                "pointer-events-none opacity-0",
                "group-hover:[@media(hover:hover)]:pointer-events-auto group-hover:[@media(hover:hover)]:opacity-100 group-hover:[@media(hover:hover)]:bg-neutral-600/50",
                isSelected && "pointer-events-auto opacity-100",
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
