import { FC } from "react";
import { cn } from "@/utils";

type GridEntryTitleProps = {
  title: string;
  className?: string;
};

export const GridEntryTitle: FC<GridEntryTitleProps> = ({
  title,
  className,
}) => (
  <span
    lang="fr"
    className={cn("index-entry-title font-serif text-sm", className)}
  >
    {title}
  </span>
);
