"use client";

import { FC } from "react";
import { cn } from "@/utils";

import { LAYERS_CONFIG, LayerType } from "@/constants/layers";

interface LegendFilterProps {
  selectedLayers: Set<LayerType>;
  onFilterChange: (layerId: LayerType) => void;
  className?: string;
  /** Carte (fond variable) vs index (fond clair) — couleur des pictos contour au repos */
  surface?: "map" | "grid";
}

const outlineIconClass = (surface: "map" | "grid") =>
  cn(
    "h-7 w-7 transition-colors",
    surface === "grid"
      ? "text-zinc-900"
      : "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]",
  );

export const LegendFilter: FC<LegendFilterProps> = ({
  selectedLayers,
  onFilterChange,
  className,
  surface = "map",
}) => {
  return (
    <nav
      aria-label="Filtres par catégorie"
      className={cn(
        "pointer-events-none absolute inset-y-0 left-6 z-30 flex flex-col justify-center gap-4",
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
                  "absolute inset-0",
                  isSelected
                    ? "opacity-0"
                    : "opacity-100 group-hover:[@media(hover:hover)]:opacity-0",
                )}
              >
                <OutlineIcon className={outlineIconClass(surface)} />
              </div>
              <div
                className={cn(
                  "absolute inset-0",
                  isSelected
                    ? "opacity-100"
                    : "opacity-0 group-hover:[@media(hover:hover)]:opacity-100",
                )}
              >
                <Icon className="h-7 w-7 mix-blend-normal" />
              </div>
            </div>

            <span
              className={cn(
                "absolute left-full z-20 ml-4 flex h-7 items-center whitespace-nowrap border border-white/20 bg-neutral-800/50 px-3 font-serif text-xs tracking-wider text-white mix-blend-normal backdrop-blur-sm",
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
