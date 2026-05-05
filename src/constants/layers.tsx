import { FC, ReactNode } from 'react';
import GolfIcon from '@/assets/LegendIcons/golf_r.svg';
import GolfOutlineIcon from '@/assets/LegendIcons/golf_outline.svg';
import IndiaIcon from '@/assets/LegendIcons/india_r.svg';
import IndiaOutlineIcon from '@/assets/LegendIcons/india_outline.svg';
import LimaIcon from '@/assets/LegendIcons/lima_r.svg';
import LimaOutlineIcon from '@/assets/LegendIcons/lima_outline.svg';
import OscarIcon from '@/assets/LegendIcons/oscar_r.svg';
import OscarOutlineIcon from '@/assets/LegendIcons/oscar_outline.svg';
import RomeoIcon from '@/assets/LegendIcons/romeo_r.svg';
import RomeoOutlineIcon from '@/assets/LegendIcons/romeo_outline.svg';
import ZuluIcon from '@/assets/LegendIcons/zulu_r.svg';
import ZuluOutlineIcon from '@/assets/LegendIcons/zulu_outline.svg';

export interface LayerConfig {
  id: string;
  label: string;
  Icon: FC<{ className?: string }>;
  OutlineIcon?: FC<{ className?: string }>;
  types: string[];
  description: ReactNode;
}

export const LAYERS_CONFIG = [
  {
    id: 'edition',
    label: 'Édition',
    Icon: GolfIcon,
    OutlineIcon: GolfOutlineIcon,
    types: ['roman', 'thèse', 'essai', 'BD', 'poésie', 'article'],
    description: (
      <>
        Ici on range les <strong>écrits</strong>, qu&apos;ils soient théoriques,
        fictionnels, universitaires, amateurs, sur papier ou à l&apos;écran, du
        moment qu&apos;ils posent les mots sans idées préconçues, et{' '}
        <strong>décrivent</strong> l&apos;état des choses pavillonnaires.
      </>
    ),
  },
  {
    id: 'musique',
    label: 'Audio',
    Icon: IndiaIcon,
    OutlineIcon: IndiaOutlineIcon,
    types: ['musique', 'clip', 'concert', 'podcast', 'mix', 'radio'],
    description: (
      <>
        Ici on écoute la <strong>radio</strong> le soir avant de dormir, on
        regarde les <strong>clips</strong> en rentrant à la maison, ou dans le{' '}
        <strong>mp3</strong> à l&apos;arrière de la voiture sur la rocade.
      </>
    ),
  },
  {
    id: 'photographie',
    label: 'Image',
    Icon: LimaIcon,
    OutlineIcon: LimaOutlineIcon,
    types: [
      'série photographique',
      'illustration',
      'arts numériques',
      'jeux vidéos',
      'sculpture',
    ],
    description: (
      <>
        Ici on trouve l&apos;<strong>image</strong> dans toutes ses nuances, du
        papier à l&apos;écran, animé ou pas, du moment qu&apos;elle documente en
        même temps qu&apos;elle développe une <strong>esthétique</strong> propre
        à la zone et ses imaginaires.
      </>
    ),
  },
  {
    id: 'audiovisuel',
    label: 'Cinéma',
    Icon: OscarIcon,
    OutlineIcon: OscarOutlineIcon,
    types: ['cinéma', 'long métrage', 'court métrage', 'série', 'vidéo'],
    description: (
      <>
        Ici on rend visible le <strong>cinéma</strong> dans toutes ces durées,
        la multiplicité et la singularité des regards posés sur le
        pavillonnaire, ou qui en expriment le quotidien et ses drames par
        l&apos;image mouvement et la <strong>narration</strong>.
      </>
    ),
  },
  {
    id: 'ville',
    label: 'Architecture',
    Icon: RomeoIcon,
    OutlineIcon: RomeoOutlineIcon,
    types: [
      'architectures',
      'maison',
      'raquette',
      'extension',
      'garage',
      'préfiguration',
      'quartiers pionniers',
    ],
    description: (
      <>
        Ici on a toutes les échelles de l&apos;<strong>architecture</strong>, du{' '}
        <strong>mobilier</strong> au <strong>lotissement</strong>, dès lors
        qu&apos;elles travaillent à partir des existants pavillonnaires, et dans
        une logique de soin, de réparation, de détournement ou d&apos;ajout.
      </>
    ),
  },
  {
    id: 'initiative',
    label: 'Initiative',
    Icon: ZuluIcon,
    OutlineIcon: ZuluOutlineIcon,
    types: [
      'théâtre',
      'exposition',
      'performance',
      'sport',
      'initiative',
      'cuisine',
    ],
    description: (
      <>
        Ici on rassemble les <strong>actions</strong> vivantes, physiques et{' '}
        <strong>performatives</strong>, qui transforment les lieux le temps de
        l&apos;éphémère ou les regards et imaginaires de façon durable.
      </>
    ),
  },
];

export type LayerType = (typeof LAYERS_CONFIG)[number]['id'];

export const LAYER_IDS = LAYERS_CONFIG.map((layer) => layer.id);

export function isLayerType(id: string): id is LayerType {
  return LAYER_IDS.includes(id);
}
