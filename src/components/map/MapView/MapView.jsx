import { useCallback } from 'react';
import Map, { NavigationControl } from 'react-map-gl/mapbox';
import { MAPBOX_TOKEN, DEFAULT_MAP_STYLE, DEFAULT_VIEW_STATE } from '../../../config/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from './MapView.module.css';

export default function MapView({
  mode = 'view',
  onMapClick,
  onLoad,
  initialViewState,
  children,
  className,
  mapRef,
}) {
  const handleClick = useCallback(
    (e) => {
      if (mode === 'edit' && onMapClick) {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      }
    },
    [mode, onMapClick]
  );

  const cursor = mode === 'edit' ? 'crosshair' : 'grab';

  return (
    <div className={`${styles.mapContainer} ${className || ''}`}>
      <Map
        ref={mapRef}
        initialViewState={initialViewState || DEFAULT_VIEW_STATE}
        mapStyle={DEFAULT_MAP_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
        onClick={handleClick}
        onLoad={onLoad}
        cursor={cursor}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        {children}
      </Map>
    </div>
  );
}
