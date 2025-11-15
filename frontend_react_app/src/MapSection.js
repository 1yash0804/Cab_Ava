import React, { useRef, useEffect } from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FaMapMarkerAlt } from 'react-icons/fa';
import bbox from '@turf/bbox';

const MAPBOX_TOKEN = 'pk.eyJ1IjoieWFzaDA4MDgiLCJhIjoiY21oZ21qMjl0MGg2MTJqcXRxYmd0NjB3cyJ9.E3bVZ4Dm0ki1zKxKd22eeg';

const MapSection = ({ predictionResult }) => {
  const mapRef = useRef();
  const [viewport, setViewport] = React.useState({
    longitude: 77.2167,
    latitude: 28.6324,
    zoom: 11,
    pitch: 45,
    bearing: -30
  });

  // Fit map to route bounds when prediction result changes
  useEffect(() => {
    if (predictionResult?.route && mapRef.current) {
      const map = mapRef.current.getMap();
      
      try {
        const [minLng, minLat, maxLng, maxLat] = bbox(predictionResult.route);
        
        map.fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          {
            padding: 80,
            duration: 1500,
            maxZoom: 14
          }
        );
      } catch (err) {
        console.error('Error fitting map bounds:', err);
      }
    }
  }, [predictionResult]);

  const routeLayerStyle = {
    id: 'route-line',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#00d4ff',
      'line-width': 6,
      'line-opacity': 0.8
    }
  };

  // Don't render if no prediction result
  if (!predictionResult?.route) {
    return null;
  }

  return (
    <section className="map-section-inline">
      <h2>Route Visualization</h2>
      <div className="map-container">
        <Map
          ref={mapRef}
          {...viewport}
          onMove={evt => setViewport(evt.viewState)}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="top-right" />
          
          {/* Route Line */}
          {predictionResult.route && (
            <Source id="route" type="geojson" data={predictionResult.route}>
              <Layer {...routeLayerStyle} />
            </Source>
          )}
          
          {/* Pickup Marker */}
          {predictionResult.pickup && (
            <Marker 
              longitude={predictionResult.pickup.longitude} 
              latitude={predictionResult.pickup.latitude}
              anchor="bottom"
            >
              <div style={{ color: '#00ff88', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                <FaMapMarkerAlt size={32} />
              </div>
            </Marker>
          )}
          
          {/* Dropoff Marker */}
          {predictionResult.dropoff && (
            <Marker 
              longitude={predictionResult.dropoff.longitude} 
              latitude={predictionResult.dropoff.latitude}
              anchor="bottom"
            >
              <div style={{ color: '#ff4444', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                <FaMapMarkerAlt size={32} />
              </div>
            </Marker>
          )}
        </Map>
      </div>
    </section>
  );
};

export default MapSection;