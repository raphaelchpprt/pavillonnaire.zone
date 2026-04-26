'use client';

import useMediaQuery from '@/hooks/useMediaQuery';
import { useEffect, useRef, useState } from 'react';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import ReactDOM from 'react-dom';
import mapboxgl, { MapboxGeoJSONFeature, Marker } from 'mapbox-gl';
import { Tooltip } from '@/components/Tooltip';
import { LAYER_IDS, LayerType } from '@/constants/layers';

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

export function useMapBox() {
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

    // Navigation control (zoom buttons)
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

      // Create tooltip node
      const tooltipNode = document.createElement('div');

      // TODO: replace deprecated ReactDOM.render below by createRoot.
      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(<Tooltip feature={feature} />, tooltipNode);

      // Set tooltip on map
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

    // Clean up on unmount
    return () => map.remove();
  }, [isLaptop]);

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

  return { mapContainerRef, feature, toggleLayer, selectedLayers, isMapLoaded };
}
