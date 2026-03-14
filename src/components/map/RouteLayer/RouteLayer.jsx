import { Source, Layer } from 'react-map-gl/mapbox';
import { buildLineGeoJSON, groupPinsByDay } from '../../../utils/mapHelpers';
import { getDayColor } from '../../../utils/constants';

export default function RouteLayer({ pins, days }) {
  const grouped = groupPinsByDay(pins);

  return (
    <>
      {days.map((day) => {
        const dayPins = grouped[day.dayNumber];
        const geoJSON = buildLineGeoJSON(dayPins);
        if (!geoJSON) return null;

        const color = getDayColor(day.dayNumber);
        const sourceId = `route-line-day-${day.dayNumber}`;
        const layerId = `route-line-layer-day-${day.dayNumber}`;

        return (
          <Source key={sourceId} id={sourceId} type="geojson" data={geoJSON}>
            <Layer
              id={layerId}
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
              }}
              paint={{
                'line-color': color,
                'line-width': 3,
                'line-opacity': 0.8,
              }}
            />
          </Source>
        );
      })}
    </>
  );
}
