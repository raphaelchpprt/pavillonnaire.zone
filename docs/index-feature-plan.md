# Plan — Feature Index (filtres + grille)

> Document de travail conservé entre sessions. Source de vérité du plan d'implémentation de la feature "Index" sur pavillonnaire.zone.
> Dernière mise à jour : 2026-04-26.

---

## 1. Objectif de la feature

Créer un menu de filtres / recherche approfondie en vis-à-vis de la map, et donner accès à une visualisation de toutes les Entrées au format grille ("carrousel") en alternative à la map.

Référence d'inspiration : https://www.sana-incubateur.fr/carte

---

## 2. Spec UX résumée

### 2.1 Réorganisation des coins de l'écran

| Coin        | Avant                                             | Après                                                |
| ----------- | ------------------------------------------------- | ---------------------------------------------------- |
| Haut-gauche | Bouton About (rotation 45°)                       | **Inchangé**                                         |
| Haut-centre | Titre `pavillonnaire.zone` (mix-blend-difference) | **Inchangé**                                         |
| Haut-droite | Mapbox NavigationControl (zoom)                   | **NEW** Bouton `i` (ouvre panneau filtres)           |
| Bas-gauche  | Bouton Instagram                                  | NavigationControl Mapbox (boussole + zoom, tel quel) |
| Bas-centre  | —                                                 | —                                                    |
| Bas-droite  | Searchbar Mapbox Geocoder                         | **Inchangé**                                         |

Le bouton Instagram est déplacé **dans la modale About**, au même endroit visuel (bas-gauche du contenu About).

### 2.2 Panneau filtres (slide-in droite)

- Déclenché par le bouton `i` haut-droite
- Largeur calée sur la searchbar Mapbox dépliée (≈ 360 px max)
- Fond blanc opaque
- Header : titre `index` (Redaction 20 bold) + croix de fermeture
- 4 sections collapsibles : `Date`, `Auteur.ices`, `Lieu`, `Type`
  - Titres en **gras**, valeurs dépliées en **regular** (Redaction 20)
  - Au clic sur une valeur : la valeur passe en **pill blanc-sur-noir** + petite croix à droite (retire le filtre)
  - Multi-sélection autorisée
- Footer : interrupteur `Carte ↔ Grille` (mode actif en gras)

### 2.3 Logique de filtrage

- **Intra-champ** : OR (sélectionner 2020 et 2021 dans Date → on montre les deux)
- **Inter-champs** : AND (Date sélectionnée AND Type sélectionné)
- Les filtres s'appliquent **simultanément** à la map et à la grille
- Les 6 légendes catégories à gauche (`LegendFilter`) restent actives en parallèle, comme couche de filtre supplémentaire

### 2.4 Vue Grille

- Mosaïque de toutes les Entrées (filtrées)
- Images à leurs **formats natifs**, alignées par le bas, marges égales gauche/droite
- Titre sous chaque image (Redaction 20)
- Logo catégorie sous le titre
- **Comportement couleur** :
  - Repos : `grayscale(1)` (noir et blanc)
  - Hover : `grayscale(0)` (couleur)
  - Clic : couleur figée persistante (état "épinglé")
  - Idem pour le logo catégorie
- **Variante optionnelle à tester** : filtre type pixel (`image-rendering: pixelated`)
- **Scroll** : titre `pavillonnaire.zone` en `mix-blend-difference` mange les images sous lui (déjà existant en haut)
- Scrollbar fine sur le côté
- Légende catégories à gauche conservée et toujours filtrante
- Clic sur une tuile → ouvre `DetailsModal` en overlay (idem clic sur marker map)

### 2.5 Modale détail (DetailsModal)

- Largeur cible : **25 %** (1/4 d'écran), au lieu de 33 % actuellement
- Min : 350 px
- Mobile : full-screen (déjà OK)

---

## 3. État des lieux du code (cartographie)

### 3.1 Stack

- Next.js 13 App Router
- Mapbox GL JS 2.15.0 + Mapbox Geocoder
- Tailwind 3.3 + `clsx` + `tailwind-merge`
- Pas de Zustand / Redux / Context — useState local + URL params
- Polices : Redaction35 (corps) + Yoster-Island (titres)

### 3.2 Fichiers centraux

| Fichier                            | Rôle                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| `src/app/page.tsx`                 | Entry point — Homepage + Instagram + titre                                        |
| `src/app/layout.tsx`               | Layout global, polices, styles Mapbox                                             |
| `src/app/api/send/route.ts`        | Pattern de référence pour route API (POST + try/catch)                            |
| `src/components/Homepage.tsx`      | Orchestre About + map + LegendFilter + DetailsModal                               |
| `src/hooks/useMapBox.tsx`          | Init Mapbox, état des layers (`Set<LayerType>`), filtres légende                  |
| `src/components/LegendFilter.tsx`  | 6 icônes catégories à gauche (toggle visibility par layer)                        |
| `src/constants/layers.tsx`         | Config des 6 catégories (Edition, Audio, Image, Cinéma, Architecture, Initiative) |
| `src/components/DetailsModal.tsx`  | Panneau détail Entrée (actuellement `w-[max(33%,350px)]`)                         |
| `src/components/ImageCarousel.tsx` | Carousel d'images dans la modale (avec lightbox)                                  |
| `src/components/About.tsx`         | Modale About (texte, contributeurs, form contact)                                 |
| `src/components/Instagram.tsx`     | Bouton Instagram SVG                                                              |
| `src/utils.ts`                     | Utility `cn()` (clsx + twMerge) à utiliser systématiquement                       |
| `src/styles/global.css`            | @font-face Redaction/Yoster, overrides Mapbox geocoder                            |
| `tailwind.config.js`               | Tailwind config (font-serif → Yoster, plugin scrollbar-hide)                      |

### 3.3 Source de données Mapbox

- 27 **tilesets** (vector) sur le compte Mapbox, affichés via le style `NEXT_PUBLIC_MAPBOX_STYLE`
- **6 datasets sources** correspondant aux 6 catégories filtrables : `ville`, `initiative`, `audiovisuel`, `photographie`, `edition`, `musique`
- Mapping catégorie ↔ dataset (à confirmer en Phase 2 via `src/constants/layers.tsx`) :
  - Architecture ↔ `ville`
  - Initiative ↔ `initiative`
  - Cinéma ↔ `audiovisuel`
  - Image ↔ `photographie`
  - Edition ↔ `edition`
  - Audio ↔ `musique`
- Les autres tilesets (`sports`, `fashion`, `bozarts`...) n'ont pas de dataset source — probablement non exposés dans la légende, à vérifier
- **Schéma `properties`** d'une feature (observé dans `DetailsModal`) : `title`, `type`, `author`, `director`, `artist`, `album`, `editor`, `year`, `place`, `image`, `images` (JSON string), `abstract`, `link`

### 3.4 État existant des filtres (légende)

- État dans `useMapBox`: `selectedLayers: Set<LayerType>`
- Toggle via `setLayoutProperty(layerId, 'visibility', 'none' | 'visible')`
- Si `selectedLayers` est vide → tout est visible
- Pas de filtre sur les `properties`, uniquement on/off par layer

---

## 4. Décisions actées

| #   | Décision                                          | Choix                                                                                                                   |
| --- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| D1  | Source des Entrées pour la grille et les facettes | **Option A** : route Next.js `/api/entries` qui agrège les 6 datasets via API Mapbox Datasets (token secret), cache ISR |
| D2  | Logique multi-valeurs intra-champ                 | OR                                                                                                                      |
| D3  | Logique inter-champs                              | AND                                                                                                                     |
| D4  | Persistance d'état                                | URL params (cohérent avec About qui utilise déjà `?view=`)                                                              |
| D5  | Titre du panneau                                  | `index`                                                                                                                 |
| D6  | Icône bouton coin haut-droite                     | `i` typographique (Redaction), à valider visuellement (vs SVG dédié)                                                    |
| D7  | Stratégie de livraison                            | **Phasée** (4 phases mergeable indépendamment)                                                                          |
| D8  | Largeur modale détail                             | 25 % (au lieu de 33 %), min 350 px                                                                                      |
| D9  | "Nord" en bas-gauche                              | Le `NavigationControl` Mapbox tel quel (zoom + boussole), simplement déplacé                                            |
| D10 | Filtres dynamiques                                | Valeurs des champs Date/Auteur/Lieu/Type **calculées dynamiquement** depuis l'agrégat des 6 datasets                    |
| D11 | Modale depuis grille                              | Ouverture en **overlay** par-dessus la grille (idem map)                                                                |

### Variables d'env à configurer (Phase 2)

À ajouter dans `.env.local` (à fournir par l'utilisateur) :

```
MAPBOX_SECRET_TOKEN=sk.xxx           # token secret Mapbox (scope datasets:read)
MAPBOX_USER=<user_handle>            # username Mapbox
MAPBOX_DATASET_IDS=ville,initiative,audiovisuel,photographie,edition,musique
# OU
MAPBOX_DATASET_IDS=<csv des dataset_id réels si différents des handles>
```

Note : le token doit être **secret (sk.)**, pas le public token (pk.) déjà utilisé pour le rendu Mapbox client. Scope nécessaire : `datasets:read`.

---

## 5. Vérification de viabilité — Mapbox API gratuite

Vérification effectuée le 2026-04-26 sur les pages officielles Mapbox.

### 5.1 Free tier 2026 (chiffres officiels)

| Produit                  | Quota gratuit / mois                                                | Coût au-delà           |
| ------------------------ | ------------------------------------------------------------------- | ---------------------- |
| Mapbox GL JS — Map Loads | **50 000**                                                          | $5 / 1 000 loads       |
| Vector Tiles API         | **200 000** requêtes                                                | $0.25 / 1 000          |
| Mapbox GL JS — Seats     | 3 utilisateurs gratuits                                             | —                      |
| Tilesets hosting         | 750 jours / mois                                                    | $0.0137 / jour au-delà |
| **Datasets API**         | **Pas de quota mensuel** : seulement des **rate limits** (voir 5.2) | —                      |

### 5.2 Rate limits Datasets API

- **Lecture** : 480 requêtes / minute (par défaut, augmentable via Sales)
- **Écriture** : 40 requêtes / minute
- **Taille max d'une feature** : 1 023 KB compressé
- **Pagination** : `limit=100&start=<id>` (max 100 features par requête → pour > 100 features, paginer)

### 5.3 Notre consommation projetée

Le pattern adopté en Phase 2 est **route Next.js avec ISR (`revalidate: 3600`)** :

- 6 datasets à fetcher par revalidation
- Si chaque dataset a > 100 features, on paginera : disons 5 pages × 6 = **30 requêtes / heure** au pire
- Soit **720 requêtes / jour** en pire absolu, ≈ **22 000 / mois**
- Bien en-dessous du rate limit (480 / min suffit largement)
- **Coût : 0 €** sur le free tier
- Côté client, **0 appel direct** à l'API Mapbox Datasets (passage systématique par notre route Next.js qui sert un JSON cacheé)

### 5.4 Conclusion : le plan est viable et gratuit

✅ Le projet peut tourner **entièrement sur le free tier** Mapbox tant que :

- On reste sous 50 000 map loads / mois (chiffre actuel à vérifier dans le dashboard Mapbox)
- On n'augmente pas le ISR à des intervalles très courts (ex : revalidate < 60 s ferait ~864 req/jour, toujours OK mais inutile)
- On garde le **token secret côté serveur uniquement** (jamais exposé via `NEXT_PUBLIC_*`)

### 5.5 Garde-fous à mettre en place

- Activer **billing alerts** dans le dashboard Mapbox (à 80 % du free tier)
- En Phase 2, instrumenter la route `/api/entries` avec un log basique du nombre de features récupérées (pour détecter une explosion de volume)
- Si un jour le coût devient un problème : alternative pré-build (génération statique d'`entries.json` au `next build`, 0 req runtime). Le code de la route restera réutilisable pour ce script de build.

### 5.6 Sources consultées

- [Mapbox Pricing](https://www.mapbox.com/pricing)
- [Datasets API docs](https://docs.mapbox.com/api/maps/datasets/)
- [Pricing by products](https://docs.mapbox.com/accounts/guides/pricing/)

---

## 6. Conventions de code à respecter (audit codebase)

Audit effectué le 2026-04-26. **Tout nouveau code DOIT respecter ces règles** pour rester homogène avec l'existant.

### 6.1 TypeScript

- **Strict mode actif** (`tsconfig.json`)
- `interface` pour les structures réutilisables (ex : `LayerConfig`, `Entry`)
- `type` pour les unions, props de composants, types extraits
- **Naming des props** : suffixe `Props` (ex : `FilterPanelProps`, `EntriesGridProps`)
- **Imports** : ordre React/Next → `@/` → relatifs ; **pas de `import type` séparé** (mélangé avec imports valeur)
- Alias `@/` systématique pour les imports absolus
- Pas de `any` ; generics quand pertinent (cf. `useSwipe<T extends HTMLElement>`)

### 6.2 Composants React

- **Toujours `'use client'`** au top des composants interactifs (state, events, hooks)
- Server components réservés aux `app/layout.tsx` et `page.tsx` (par défaut)
- Pattern :

  ```tsx
  'use client';
  import { FC } from 'react';
  // ... autres imports

  type ComponentNameProps = { ... };

  export const ComponentName: FC<ComponentNameProps> = ({ propA, propB }) => { ... };
  ```

- **Named export** pour composants réutilisables
- **Default export** uniquement pour pages / layouts / route handlers
- Props **destructurées dans la signature**
- `PropsWithChildren<T>` quand on accepte `children`

### 6.3 Hooks personnalisés

- Convention : retournent un **objet** (pas un tuple), permet d'ignorer ce qu'on n'utilise pas
  ```tsx
  return { isMapLoaded, mapContainerRef, toggleLayer };
  ```
- Fichiers dans `src/hooks/`, nommés `useXxx.tsx` (ou `.ts` si pas de JSX)
- `useEffect` avec **cleanup function systématique** quand event listener / timer / subscription
- `useRef` pour DOM refs ET pour instance variables (ex : `selectedLayersRef` qui suit le state pour les closures Mapbox)

### 6.4 Tailwind & styling

- **Toujours `cn()` de `@/utils`** pour classes conditionnelles (clsx + twMerge) — jamais de concat string inline
- Breakpoints standards Tailwind (`sm:` 640, `md:` 768)
- Classes positionnement : pattern `absolute inset-y-0`, `absolute left-6 top-6`, `fixed z-50`
- Custom theme : fonts (`font-serif` → Yoster) et `text-muted` étendu
- Pas de CSS Modules — tout en utility classes Tailwind ; CSS global réservé aux overrides Mapbox / @font-face

### 6.5 État & data

- **Pas de Context API** (état levé localement ou dans hook custom)
- **Pas de Zustand / Redux**
- **Pas de SWR / React Query** : `fetch` natif + `useState` + `useEffect` dans un hook custom
- URL params : `useSearchParams()` (lecture) + `router.push()` (écriture), pattern de `Homepage.tsx:16-21`

### 6.6 Routes API (App Router)

Pattern observé dans `src/app/api/send/route.ts` :

```ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // ...
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ message: '...', error }, { status: 500 });
  }
}
```

- **Default export interdit** ici → exports nommés `GET` / `POST` / etc.
- Pour `/api/entries` : ajouter `export const revalidate = 3600` (ISR) en haut du fichier

### 6.7 Accessibilité

- **`aria-label` systématique** sur tous les boutons icône
- **`aria-pressed`** pour les toggles (cf. `LegendFilter`)
- `aria-hidden`, `<span className="sr-only">` quand pertinent
- Semantic HTML : `<button>`, `<nav>`, `<aside>`, `<form>`, `<label>`

### 6.8 Conventions à NE PAS introduire

- ❌ Pas de framer-motion (CSS transitions Tailwind suffisent)
- ❌ Pas de zod (validation simple manuelle)
- ❌ Pas de Context Provider
- ❌ Pas de SWR / React Query
- ❌ Pas de tests (le projet n'en a pas — ne pas en ajouter sans demande explicite)
- ❌ Pas de nouveau dossier ou abstraction sans nécessité (composants à plat dans `src/components/`)

### 6.9 Top 5 règles prescriptives

1. **Always** `'use client'` au top des composants interactifs
2. **Always** `FC<PropsType>` + arrow function + named export pour les composants réutilisables
3. **Always** `cn()` pour classes conditionnelles
4. **Always** cleanup function dans `useEffect` quand event listener / timer / subscription
5. **Never** exposer le token Mapbox secret côté client (ne JAMAIS le préfixer `NEXT_PUBLIC_*`)

### 6.10 Style des commits Git

Convention `<type>: <message>` (semantic) — observée dans `git log` :

- `feat:`, `fix:`, `refactor:`, `chore:`, `style:`
- Messages courts, en anglais
- Pas de Co-Authored-By (préférence utilisateur enregistrée en mémoire)

---

## 7. Plan phasé

### Phase 1 — Squelette UI (sans logique métier)

**Objectif** : réorganiser les coins, ouvrir/fermer un panneau filtres vide, ajuster la modale.

| #   | Action                                                                                                                                                                                         | Fichier(s)                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1.1 | Déplacer `<Instagram>` de `page.tsx` vers `About.tsx` (au même endroit visuel : bas-gauche du contenu About)                                                                                   | `src/app/page.tsx`, `src/components/About.tsx`, `src/components/Instagram.tsx` |
| 1.2 | Déplacer `NavigationControl` Mapbox `top-right` → `bottom-left`                                                                                                                                | `src/hooks/useMapBox.tsx` (≈ ligne 63-66)                                      |
| 1.3 | Créer `IndexButton.tsx` : bouton `i` typographique top-right, taille `h-7 w-7` (cohérent avec les autres coins), `aria-label="Ouvrir l'index"`, named export `FC<IndexButtonProps>`            | `src/components/IndexButton.tsx` (nouveau)                                     |
| 1.4 | Créer `FilterPanel.tsx` : slide-in droit (CSS transition Tailwind), fond blanc opaque, header `index` + croix close, 4 sections collapsibles vides, footer toggle `Carte ↔ Grille` (statique) | `src/components/FilterPanel.tsx` (nouveau)                                     |
| 1.5 | Câbler ouverture du panneau via URL `?index=open` (lecture/écriture côté Homepage avec `useSearchParams` + `router.push`, comme About avec `?view=about`)                                      | `src/components/Homepage.tsx`, `src/app/page.tsx`                              |
| 1.6 | Modale détail : `w-[max(33%,350px)]` → `w-[max(25%,350px)]`                                                                                                                                    | `src/components/DetailsModal.tsx` (≈ ligne 18)                                 |

**Critères d'acceptation Phase 1**

- [ ] Le bouton `i` apparaît en haut à droite, aligné avec le bouton About en miroir
- [ ] Cliquer sur `i` ouvre un panneau blanc à droite avec les 4 sections (vides), un toggle Carte/Grille, et une croix qui referme
- [ ] Le panneau survit au reload (URL contient `?index=open`)
- [ ] Le bouton Insta n'est plus visible sur la page d'accueil ; il apparaît dans la modale About
- [ ] Le `NavigationControl` Mapbox est en bas à gauche
- [ ] La modale détail est plus fine (25 %)
- [ ] **Conventions** : tous les nouveaux composants utilisent `'use client'`, `FC<XxxProps>`, named export, `cn()`, `aria-label`. Aucun warning ESLint (`next lint`).

---

### Phase 2 — Source de données + filtres dynamiques actifs

**Objectif** : agréger les 6 datasets côté serveur, calculer les filtres dynamiquement, les appliquer sur la map.

| #    | Action                                                                                                                                                                                                                                                                        | Fichier(s)                               |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 2.1  | Route handler `/api/entries` : `export async function GET()`, `export const revalidate = 3600`, appel parallèle aux 6 datasets via `https://api.mapbox.com/datasets/v1/{user}/{dataset_id}/features` (token secret), pagination si > 100 features, agrégation + normalisation | `src/app/api/entries/route.ts` (nouveau) |
| 2.2  | Fallback gracieux : si un dataset down, retourner ce qui a marché + log d'erreur                                                                                                                                                                                              | idem                                     |
| 2.3  | Variables d'env : `MAPBOX_SECRET_TOKEN`, `MAPBOX_USER`, `MAPBOX_DATASET_IDS` (jamais préfixés `NEXT_PUBLIC_*`)                                                                                                                                                                | `.env.local`                             |
| 2.4  | Type TS `Entry` (`interface Entry { ... }`) avec mapping des `properties` GeoJSON normalisées                                                                                                                                                                                 | `src/types/entry.ts` (nouveau)           |
| 2.5  | Hook `useEntries()` : `fetch('/api/entries')` natif + `useState` + `useEffect` cleanup, retour objet `{ entries, isLoading, error }`                                                                                                                                          | `src/hooks/useEntries.tsx` (nouveau)     |
| 2.6  | Calcul mémoïsé des facettes uniques par champ (Date numérique trié, autres alpha) — fonction pure dans `src/lib/facets.ts`                                                                                                                                                    | `src/lib/facets.ts` (nouveau)            |
| 2.7  | Câbler `FilterPanel` : champs collapsibles avec liste de valeurs cliquables → pill blanc/noir + croix au clic, `aria-pressed` sur chaque valeur                                                                                                                               | `src/components/FilterPanel.tsx`         |
| 2.8  | Application sur la map : combiner `setFilter` Mapbox par layer (date `in [...]`, type `in [...]`, etc.) en respectant la logique OR/AND                                                                                                                                       | `src/hooks/useMapBox.tsx`                |
| 2.9  | Persistance URL : `?date=2020,2021&type=arch&author=...&place=...` (parser/serializer, fonctions pures)                                                                                                                                                                       | `src/lib/filtersUrl.ts` (nouveau)        |
| 2.10 | Lever l'état filtres dans `Homepage` (pas de Context — passage en props vers `FilterPanel`, `LegendFilter`, `useMapBox`)                                                                                                                                                      | `src/components/Homepage.tsx`            |

**Critères d'acceptation Phase 2**

- [ ] L'API `/api/entries` renvoie un JSON agrégé, mis en cache 1h (vérifier `x-vercel-cache: HIT` après deuxième hit)
- [ ] Le panneau filtres affiche les valeurs réelles, calculées dynamiquement, pour Date/Auteur/Lieu/Type
- [ ] Sélectionner des filtres masque les markers correspondants sur la map
- [ ] Multi-sélection intra-champ = OR ; multi-champs = AND
- [ ] Les filtres survivent au reload et sont partageables par lien
- [ ] **Conventions** : route avec `export const revalidate`, hook retourne un objet, types `interface Entry`, aucun client-side fetch direct vers `api.mapbox.com` (passage par `/api/entries`)

---

### Phase 3 — Vue Grille

**Objectif** : alternative à la map en grille d'images, mêmes filtres, ouvre la modale en overlay.

| #   | Action                                                                                                                                                   | Fichier(s)                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 3.1 | Toggle `Carte ↔ Grille` dans `FilterPanel` câblé sur `?view=map\|grid` (défaut `map`)                                                                   | `src/components/FilterPanel.tsx`           |
| 3.2 | Composant `EntriesGrid.tsx` : reçoit les Entrées filtrées                                                                                                | `src/components/EntriesGrid.tsx` (nouveau) |
| 3.3 | Layout : flex-wrap avec `align-items: end`, formats natifs préservés, marges égales gauche/droite, titre Redaction 20 + logo catégorie sous chaque image | idem                                       |
| 3.4 | Image `loading="lazy"`, `decoding="async"`, `alt={entry.title}`                                                                                          | idem                                       |
| 3.5 | Comportement N&B → couleur : repos `grayscale(1)`, hover `grayscale(0)` (transition CSS), clic = pin persistant (`Set<id>` dans state local)             | idem                                       |
| 3.6 | Idem N&B → couleur sur logo catégorie sous image                                                                                                         | idem                                       |
| 3.7 | Scroll : laisser le titre `pavillonnaire.zone` en `mix-blend-difference` faire son effet ; ajuster scrollbar custom thin via CSS si besoin               | `src/styles/global.css`                    |
| 3.8 | Légende gauche `LegendFilter` reste affichée et active sur la grille                                                                                     | `src/components/Homepage.tsx`              |
| 3.9 | Clic tuile → `setSelectedFeature` → `DetailsModal` s'ouvre en overlay (réutilise l'existant)                                                             | idem                                       |

**Critères d'acceptation Phase 3**

- [ ] Le toggle bascule entre map et grille sans perte d'état (filtres + entrée sélectionnée)
- [ ] La grille respecte les filtres actifs et la légende catégories
- [ ] Les images sont N&B, deviennent couleur au hover, restent couleur au clic
- [ ] Les logos catégorie sous les images suivent la même logique
- [ ] Cliquer une tuile ouvre la modale détail par-dessus la grille
- [ ] Le scroll fait passer le titre `pavillonnaire.zone` par-dessus les images en négatif
- [ ] **Conventions** : `'use client'`, `FC<EntriesGridProps>`, `cn()` pour les classes hover/pin, `aria-label` sur les tuiles

---

### Phase 4 — Polish & variantes

| #   | Action                                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | Tester la variante filtre `pixel` sur images (CSS `image-rendering: pixelated`) — pas de shader / framer-motion                  |
| 4.2 | Animation slide-in du panneau filtres : `transition-transform duration-200 ease-out translate-x-full` (pure Tailwind)            |
| 4.3 | Audit responsive mobile : panneau full-width, grille en 2 colonnes, modale full-screen                                           |
| 4.4 | Accessibilité clavier : Tab focus order, Esc ferme panneau/modale, focus trap dans modale (cohérent avec ImageCarousel existant) |
| 4.5 | Si > 200 entrées et perf dégradée : envisager virtualization (mais ne pas l'introduire prématurément — mesurer d'abord)          |
| 4.6 | Vérification Lighthouse / Core Web Vitals sur la grille                                                                          |

---

## 8. Ordre d'exécution Phase 1

1. Action **1.6** (modale 25 %) — trivial, 1 ligne
2. Action **1.1** (Insta → About) — déplacement composant
3. Action **1.2** (NavigationControl bottom-left) — config Mapbox
4. Action **1.3** (`IndexButton`) — nouveau composant simple
5. Action **1.4** (`FilterPanel` shell) — gros morceau visuel
6. Action **1.5** (URL param `index`)

À la fin de chaque action : `npx next lint` doit passer sans erreur.

---

## 9. Risques & points d'attention

- **Schéma de propriétés non garanti uniforme** entre les 6 datasets : vérifier que `year`, `place`, `type`, `author` existent sur tous, sinon prévoir un mapper de normalisation par dataset dans `/api/entries/route.ts`.
- **Auteurs.ices** : peut être un champ multi-valeurs (`author`, `director`, `artist`, `album`, `editor` selon le type) → la facette "Auteur.ices" devra peut-être agréger plusieurs champs source.
- **Volume des datasets** : pagination Datasets API à 100 features max par requête. Si un dataset > 100 entrées, paginer avec `start=<last_id>`.
- **Rate limit Mapbox Datasets API** : 480 reads/min — non bloquant à notre échelle (avec ISR 1h, on est à ~30 req/h max).
- **Limite taille feature Mapbox** : 1 023 KB compressé / feature — non bloquant à notre échelle (les images sont stockées en URL, pas inline).
- **Taille de la réponse `/api/entries`** : si lourde, envisager de stripper les `geometry` pour la grille (on n'en a pas besoin) et garder une payload `properties + id`.
- **Cohérence map ↔ grille** : si l'API renvoie des entrées que les tilesets n'ont pas (ou inversement), il y aura divergence. À surveiller.
- **Token secret Mapbox** : ne JAMAIS l'exposer côté client. Doit rester dans la route Next.js uniquement (jamais préfixé `NEXT_PUBLIC_*`).
- **Map Loads** : actuellement le free tier permet 50 000 / mois. Vérifier dans le dashboard Mapbox la consommation actuelle avant de pousser en prod.

---

## 10. Checklist de reprise (pour session future)

- [ ] Lire ce document en entier
- [ ] Vérifier la branche actuelle : `git branch --show-current`
- [ ] Vérifier l'état de la phase courante : `git log --oneline -10`
- [ ] Identifier la prochaine action non cochée dans la phase courante
- [ ] Vérifier que les variables d'env nécessaires sont en place (à partir de Phase 2)
- [ ] Relire la section 6 (Conventions) avant d'écrire du nouveau code

### Avancement

- [x] **Phase 1** — Squelette UI ✅ 2026-04-26
  - [x] 1.1 Insta → About
  - [x] 1.2 NavigationControl bottom-left
  - [x] 1.3 IndexButton
  - [x] 1.4 FilterPanel shell
  - [x] 1.5 URL param `index`
  - [x] 1.6 Modale 25 %
- [ ] **Phase 2** — Données + filtres actifs
  - [ ] 2.1 Route `/api/entries`
  - [ ] 2.2 Fallback gracieux
  - [ ] 2.3 Env vars
  - [ ] 2.4 Type `Entry`
  - [ ] 2.5 Hook `useEntries`
  - [ ] 2.6 Calcul facettes
  - [ ] 2.7 FilterPanel câblé
  - [ ] 2.8 Application Mapbox `setFilter`
  - [ ] 2.9 Persistance URL
  - [ ] 2.10 Levée d'état
- [ ] **Phase 3** — Vue Grille
  - [ ] 3.1 Toggle `?view=`
  - [ ] 3.2 EntriesGrid
  - [ ] 3.3 Layout
  - [ ] 3.4 Lazy load
  - [ ] 3.5 N&B → couleur
  - [ ] 3.6 Logos catégorie
  - [ ] 3.7 Scroll + scrollbar
  - [ ] 3.8 LegendFilter actif
  - [ ] 3.9 Modale en overlay
- [ ] **Phase 4** — Polish
  - [ ] 4.1 Variante pixel
  - [ ] 4.2 Animation slide-in
  - [ ] 4.3 Responsive mobile
  - [ ] 4.4 Accessibilité clavier
  - [ ] 4.5 Virtualization (si besoin)
  - [ ] 4.6 Lighthouse

---

## 11. Références

- Spec source : `Spec Feature Index PAV.ZONE.pdf` (note Apple partagée)
- Inspiration : https://www.sana-incubateur.fr/carte
- API Mapbox Datasets : https://docs.mapbox.com/api/maps/datasets/
- Mapbox Pricing : https://www.mapbox.com/pricing
- Branch de départ : `main`
