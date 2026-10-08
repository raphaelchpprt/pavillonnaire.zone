'use client';

import { ContributionForm } from '@/components/ContributionForm';
import { Flags } from '@/components/Flags';
import { FC } from 'react';

export const About: FC = () => {
  return (
    <div className="h-full overflow-auto text-white scrollbar-hide w-[min(100%,44rem)] flex flex-col gap-4 px-1">
      <div className="flex w-full justify-end">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 500 500"
          className="w-40"
        >
          <path
            fill="none"
            stroke="#FFF"
            strokeWidth="5"
            strokeMiterlimit="10"
            d="M350.345 383.414c-6.536-3.1-4.12-30.707-4.12-38.904 0-15.016-.471-29.215-4.171-43.834-8.88-35.078-11.092-70.56-31.772-103.357-15.878-25.181-48.837-48.157-80.607-60.711-25.358-10.02-49.727-19.585-77.932-22.13-2.657 21.1 20.924 42.882 24.169 63.915-3.6-12.462-13.609-24.203-18.178-36.248-3.33-8.784-6.428-19.754-8.079-28.451 18.307-.711 37.379 1.427 55.293-1.726 13.279-2.338 26.508-6.671 40.35-7.125"
          />
        </svg>
      </div>
      <p className="text-justify">
        Le suburbain est un territoire trop souvent stéréotypé. Dominée par un{' '}
        <em>urban gaze</em> a minima méprisant, l&apos;idée d&apos;une culture
        pavillonnaire reste fragile et peine à exister. Qu&apos;est-ce que
        cachent ces maisons que beaucoup croient toutes identiques ? Qu&apos;en
        pensent leurs habitants, et quels univers y ont-ils développés ?
      </p>
      <p className="text-justify">
        Le <span className="font-serif">pavillonnaire.zone</span> est un espace
        contributif dont le but est de faire émerger les éléments d&apos;une
        culture pavillonnaire, en même temps qu&apos;il permet de les situer. Un
        espace virtuel et indépendant, support cliquable de cette archive
        géolocalisée.
      </p>
      <p className="text-justify">
        La map donne à voir, sans ambiguïté et pour la première fois, la
        silhouette du pavillonnaire sur le territoire français. Pixels noirs
        éparpillés entre campagnes et centres-villes, la trace est issue
        d&apos;un traitement des{' '}
        <a
          className="underline"
          href="https://www.insee.fr/fr/statistiques/2520034"
          target="_blank"
          rel="noreferrer"
        >
          données carroyées
        </a>{' '}
        de l&apos;INSEE. Chaque pixel correspond à un carreau de 200 × 200
        mètres, estimé à{' '}
        <a
          className="underline"
          href="http://www.donnees.normandie.developpement-durable.gouv.fr/pavillonnaire/details.html"
          target="_blank"
          rel="noreferrer"
        >
          dominante pavillonnaire
        </a>
        .
      </p>
      <p className="text-justify">
        L&apos;archive explore l&apos;idée d&apos;une culture pavillonnaire, au
        travers des travaux ou des expériences qui en émanent. Elle rassemble un
        imaginaire en constellation, sans souci de hiérarchie entre les
        différents items qui la composent. Un catalogue contributif, à prendre
        comme enquête par accumulation, pour l&apos;épanouissement d&apos;un{' '}
        <em>suburban gaze</em>.
      </p>

      <p className="text-justify">
        Chaque item ajouté à la map correspond à l&apos;un des 6 univers qui
        quadrillent cet espace. Ils sont signalés par un des pavillons couleur
        rose enduit et nous guident à la navigation dans la zone :
      </p>

      <Flags />

      <p>Pavillonnairement,</p>

      <p>
        <a
          className="underline"
          href="https://www.instagram.com/sabrimyllaud/"
          target="_blank"
          rel="noreferrer"
        >
          Samy
        </a>
        ,{' '}
        <a
          className="underline"
          href="https://twitter.com/williamhzo"
          target="_blank"
          rel="noreferrer"
        >
          William
        </a>{' '}
        et{' '}
        <a
          className="underline"
          href="https://www.linkedin.com/in/raphaelchappert/"
          target="_blank"
          rel="noreferrer"
        >
          Raphaël
        </a>
        , qui ont eux-mêmes grandi dans la zone.
      </p>

      <p className="text-justify">
        P.-S. : on vous invite à aller voir du côté du blog{' '}
        <a
          className="underline"
          href="https://lotxlotxlot.com/"
          target="_blank"
          rel="noreferrer"
        >
          LOT
        </a>{' '}
        et de ses contributeur.ices, avec lesquels{' '}
        <span className="font-serif">pavillonnaire.zone</span> entretient des
        liens de plus en plus étroits.
      </p>

      <p>
        Fontes utilisées :{' '}
        <a
          className="underline"
          href="https://www.redaction.us/"
          target="_blank"
          rel="noreferrer"
        >
          Redaction
        </a>{' '}
        par Forest Young et Jeremy Mickel +{' '}
        <a
          className="underline"
          href="https://www.zone38.net/font/"
          target="_blank"
          rel="noreferrer"
        >
          Yoster Island
        </a>{' '}
        par codeman38.
      </p>

      <div className="my-8">
        <svg
          width="18"
          height="67"
          viewBox="0 0 18 67"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.2102 0.240234C12.1802 0.870234 11.2202 9.34023 11.0202 10.4502C10.8402 11.4302 9.98017 12.1802 9.59017 13.1102C9.09017 14.3202 9.68017 15.5302 9.09017 16.6702C8.66017 17.4902 8.03017 17.5402 7.90017 18.5402C7.76017 19.6002 7.92016 20.6902 7.89016 21.7502C7.84016 23.5802 9.48016 24.5602 9.43016 26.4202C9.39016 28.0202 9.44016 29.6302 9.44016 31.2402V41.5702V59.4402C9.44016 60.2902 10.2502 63.6502 9.52016 64.1702C7.78016 65.3902 6.33016 62.4802 5.78016 61.6602C4.94016 60.3902 3.78016 59.8402 2.68016 58.7402C2.13016 58.1902 0.230157 55.7802 0.250157 55.1802C2.81016 55.6502 2.61015 57.6402 3.42015 58.8402C4.15015 59.9102 5.40017 60.7702 6.54017 61.6502C8.16017 62.8902 8.32016 65.0702 10.0302 65.9702C10.3302 64.8302 11.0502 64.0402 11.5902 63.0702C12.1402 62.0702 11.5002 60.9202 11.7302 59.8902C12.0302 58.5302 14.7002 55.1702 17.1402 54.7202"
            stroke="white"
            strokeWidth="1"
          />
        </svg>
      </div>

      <p>
        Pour{' '}
        <a
          className="underline"
          href="./assets/guide-contribution.pdf"
          target="_blank"
          rel="noreferrer"
        >
          contribuer
        </a>{' '}
        il suffit de remplir les champs en dessous (plus c&apos;est précis mieux
        c&apos;est !).
      </p>

      <ContributionForm />
    </div>
  );
};
