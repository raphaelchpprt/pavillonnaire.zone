"use client";

import { FC } from "react";

type GridStatusProps =
  | { kind: "loading" }
  | { kind: "error"; onRetry: () => void }
  | { kind: "empty" }
  | { kind: "empty-filtered"; onReset: () => void };

const YOSTER = { fontFamily: "Yoster-Island" } as const;

const ACTION_CLASS =
  "border-[1.5px] border-black px-4 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors duration-200 hover:border-rose-400 hover:bg-rose-400 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400";

/** Loading / error / empty states for the index grid, in the site's
 *  black-and-white brutalist register with the single rose accent. */
export const GridStatus: FC<GridStatusProps> = (props) => {
  return (
    <div className="index-content-gutter index-grid-scroll flex h-full w-full flex-col items-center justify-center gap-4 pb-8 text-center">
      {props.kind === "loading" && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center gap-3"
        >
          <span
            aria-hidden
            className="h-2 w-2 animate-pulse bg-rose-400 motion-reduce:animate-none"
          />
          <span
            style={YOSTER}
            className="text-xs uppercase tracking-[0.2em] text-gray-500"
          >
            Chargement de l’index
          </span>
        </div>
      )}

      {props.kind === "error" && (
        <div role="alert" className="flex flex-col items-center gap-4">
          <p className="max-w-xs text-gray-900">
            Le chargement de l’index a échoué.
          </p>
          <button type="button" onClick={props.onRetry} className={ACTION_CLASS}>
            Réessayer
          </button>
        </div>
      )}

      {props.kind === "empty" && (
        <p className="max-w-xs text-gray-500">
          Aucune entrée à afficher pour le moment.
        </p>
      )}

      {props.kind === "empty-filtered" && (
        <div className="flex flex-col items-center gap-4">
          <p className="max-w-xs text-gray-900">
            Aucune entrée ne correspond à ces filtres.
          </p>
          <button type="button" onClick={props.onReset} className={ACTION_CLASS}>
            Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
};
