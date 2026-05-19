'use client';

import useMediaQuery from '@/hooks/useMediaQuery';
import { useEffect, useRef, useState } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import ReactDOM from 'react-dom';
import mapboxgl, { MapboxGeoJSONFeature, Marker } from 'mapbox-gl';
import { Tooltip } from '@/components/Tooltip';
import { LAYER_IDS, LayerType } from '@/constants/layers';
import {
  buildMapboxAuthorMatch,
  buildMapboxMultiValueFilter,
} from '@/lib/normalize';
import { AUTHOR_FILTER_FIELDS, ActiveFilters } from '@/types/entry';

const INITIAL_LONGITUDE = 1.872;
const INITIAL_LATITUDE = 46.62;
const MOBILE_INITIAL_ZOOM = 4.2;
const DESKTOP_INITIAL_ZOOM = 4.4;
const ZOOM_LIMIT = 3;

const getEffectiveVisibleLayers = (selection: Set<LayerType>) => {
  if (selection.size === 0) {
    return new Set(LAYER_IDS);
  }
  return selection;
};

function buildLayerFilter(activeFilters: ActiveFilters): unknown[] | null {
  const conditions: unknown[][] = [];

  if (activeFilters.date.length > 0) {
    conditions.push([
      'any',
      ...activeFilters.date.map((d) => ['==', ['to-string', ['get', 'year']], d]),
    ]);
  }
  const typeFilter = buildMapboxMultiValueFilter('type', activeFilters.type);
  if (typeFilter) conditions.push(typeFilter);

  const placeFilter = buildMapboxMultiValueFilter('place', activeFilters.place);
  if (placeFilter) conditions.push(placeFilter);

  if (activeFilters.author.length > 0) {
    conditions.push([
      'any',
      ...activeFilters.author.flatMap((a) =>
        AUTHOR_FILTER_FIELDS.map((f) => buildMapboxAuthorMatch(f, a)),
      ),
    ]);
  }

  return conditions.length > 0 ? ['all', ...conditions] : null;
}

export function useMapBox(activeFilters: ActiveFilters, isMapVisible = true) {
  const [feature, setFeature] = useState<MapboxGeoJSONFeature | undefined>();
  const [selectedLayers, setSelectedLayers] = useState<Set<LayerType>>(
    new Set()
  );
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const isLaptop = useMediaQuery('(min-width: 1024px)');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const tooltipRef = useRef(new mapboxgl.Popup({ offset: [0, 0] }));
  const selectedLayersRef = useRef<Set<LayerType>>(new Set());

  useEffect(() => {
    const map: mapboxgl.Map = new mapboxgl.Map({
      container: mapContainerRef.current as HTMLDivElement,
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN,
      style: process.env.NEXT_PUBLIC_MAPBOX_STYLE,
      center: [INITIAL_LONGITUDE, INITIAL_LATITUDE],
      zoom: isLaptop ? DESKTOP_INITIAL_ZOOM : MOBILE_INITIAL_ZOOM,
      minZoom: ZOOM_LIMIT,
    });

    mapRef.current = map;

    const geocoder = new MapboxGeocoder({
      accessToken: process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN as string,
      countries: 'fr',
      language: 'fr-FR',
      placeholder: 'Recherche par lieu',
      mapboxgl: mapboxgl,
      collapsed: true,
      limit: 3,
      enableEventLogging: false,
      marker: { color: '#000' } as unknown as Marker,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showZoom: false }),
      'bottom-left'
    );

    // Search
    map.addControl(geocoder, 'bottom-right');
    map.once('styledata', () => {
      setIsMapLoaded(true);
    });

    function getVisibleFeatures(point: mapboxgl.Point) {
      const effectiveLayers = getEffectiveVisibleLayers(
        selectedLayersRef.current
      );
      return map.queryRenderedFeatures(point, {
        layers: Array.from(effectiveLayers),
      });
    }

    // see https://docs.mapbox.com/help/tutorials/add-points-pt-3/ for more.
    // see https://github.com/mapbox/mapbox-react-examples/blob/master/react-tooltip/src/Map.js.

    function renderTooltip(event: mapboxgl.MapMouseEvent & mapboxgl.EventData) {
      const features = getVisibleFeatures(event.point);

      if (!features.length) {
        map.getCanvas().style.cursor = 'inherit';
        tooltipRef.current.remove();
        return;
      }

      const feature = features[0];
      setFeature(feature);

      map.getCanvas().style.cursor = 'pointer';

      const tooltipNode = document.createElement('div');

      // TODO: replace deprecated ReactDOM.render below by createRoot.
      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(<Tooltip feature={feature} />, tooltipNode);

      tooltipRef.current
        .setLngLat(event.lngLat)
        .setDOMContent(tooltipNode)
        .addTo(map);
    }

    // desktop
    map.on('mousemove', renderTooltip);

    function toggleDetailsDialog(
      event: mapboxgl.MapMouseEvent & mapboxgl.EventData
    ) {
      const dialog = document.getElementById('details-dialog');

      const features = getVisibleFeatures(event.point);

      if (!features.length) {
        dialog?.classList.add('hidden');
        setFeature(undefined);
        return;
      }

      dialog?.classList.remove('hidden');
    }

    map.on('click', toggleDetailsDialog);

    return () => {
      prevFilterKeyRef.current = '';
      map.remove();
    };
  }, [isLaptop]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded || !isMapVisible) return;

    let cancelled = false;
    const resize = () => {
      if (!cancelled) map.resize();
    };
    requestAnimationFrame(() => requestAnimationFrame(resize));

    return () => {
      cancelled = true;
    };
  }, [isMapVisible, isMapLoaded]);

  const prevFilterKeyRef = useRef('');
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    const filterKey = JSON.stringify(activeFilters);
    if (filterKey === prevFilterKeyRef.current) return;
    prevFilterKeyRef.current = filterKey;

    const filter = buildLayerFilter(activeFilters);
    LAYER_IDS.forEach((id) => {
      if (mapRef.current?.getLayer(id)) {
        const map = mapRef.current;
        map.setFilter(id, filter as Parameters<typeof map.setFilter>[1]);
      }
    });
  }, [activeFilters, isMapLoaded]);

  const toggleLayer = (layerId: LayerType) => {
    setSelectedLayers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
      } else {
        newSet.add(layerId);
      }

      selectedLayersRef.current = newSet;

      const effectiveLayers = getEffectiveVisibleLayers(newSet);

      LAYER_IDS.forEach((id) => {
        if (mapRef.current?.getLayer(id)) {
          const isVisible = effectiveLayers.has(id as LayerType);
          mapRef.current.setLayoutProperty(
            id,
            'visibility',
            isVisible ? 'visible' : 'none'
          );
        }
      });

      return newSet;
    });
  };

  const clearSelectedLayers = () => {
    const empty = new Set<LayerType>();
    selectedLayersRef.current = empty;
    setSelectedLayers(empty);

    LAYER_IDS.forEach((id) => {
      if (mapRef.current?.getLayer(id)) {
        mapRef.current.setLayoutProperty(id, 'visibility', 'visible');
      }
    });
  };

  return {
    mapContainerRef,
    feature,
    toggleLayer,
    clearSelectedLayers,
    selectedLayers,
    isMapLoaded,
  };
}
