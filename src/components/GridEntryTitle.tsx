"use client";

import { FC, useLayoutEffect, useRef, useState } from "react";
import { splitGridTitle, type GridTitleLines } from "@/lib/splitGridTitle";

type GridEntryTitleProps = {
  title: string;
};

export const GridEntryTitle: FC<GridEntryTitleProps> = ({ title }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<GridTitleLines>({
    line1: title,
    line2: "",
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      setLines(splitGridTitle(el, title));
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => observer.disconnect();
  }, [title]);

  return (
    <span
      ref={ref}
      lang="fr"
      className="index-entry-title font-serif text-sm leading-snug"
      title={title}
    >
      <span className="index-entry-title-line">{lines.line1}</span>
      {lines.line2 ? (
        <span className="index-entry-title-line index-entry-title-line--ellipsis">
          {lines.line2}
        </span>
      ) : null}
    </span>
  );
};
