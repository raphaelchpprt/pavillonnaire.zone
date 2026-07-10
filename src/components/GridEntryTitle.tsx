import { FC } from "react";

type GridEntryTitleProps = {
  title: string;
};

export const GridEntryTitle: FC<GridEntryTitleProps> = ({ title }) => (
  <span
    lang="fr"
    className="index-entry-title font-serif text-sm leading-snug"
    title={title}
  >
    {title}
  </span>
);
