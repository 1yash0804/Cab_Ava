import React, { useState } from 'react';
import { FaLocationArrow, FaMapPin, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { LOCATIONS_IN_DELHI } from './locations';

const MAPBOX_TOKEN = 'pk.eyJ1IjoieWFzaDA4MDgiLCJhIjoiY21oZ21qMjl0MGg2MTJqcXRxYmd0NjB3cyJ9.E3bVZ4Dm0ki1zKxKd22eeg';

// Geocode cache to avoid repeated API calls for same locations
const geocodeCache = {};

const MagicBookingPanel = ({ setPredictionResult }) => {
  const [pickup, setPickup] = useState(LOCATIONS_IN_DELHI[0]);
  const [dropoff, setDropoff] = useState(LOCATIONS_IN_DELHI[1]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Geocode location name to coordinates
  const geocodeLocation = async (locationName) => {
    // Check cache first
    if (geocodeCache[locationName]) {
      return geocodeCache[locationName];
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName + ', Delhi, India')}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        const coords = { 
          longitude, 
          latitude, 
          name: locationName 
        };
        // Cache the result
        geocodeCache[locationName] = coords;
        return coords;
      }
      throw new Error(`Location "${locationName}" not found`);
    } catch (err) {
      throw new Error(`Failed to geocode ${locationName}`);
    }
  };

  // Get route between two points
  const getRoute = async (pickupCoords, dropoffCoords) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoords.longitude},${pickupCoords.latitude};${dropoffCoords.longitude},${dropoffCoords.latitude}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        return {
          type: 'Feature',
          geometry: data.routes[0].geometry,
          properties: {
            distance: data.routes[0].distance,
            duration: data.routes[0].duration
          }
        };
      }
      throw new Error('Route not found');
    } catch (err) {
      throw new Error('Failed to get route');
    }
  };

  // Get prediction from your backend API
  const getPrediction = async (pickupCoords, dropoffCoords, routeData) => {
    // MOCK PREDICTION (Replace with your actual API)
    const distanceKm = (routeData.properties.distance / 1000).toFixed(2);
    const durationMin = Math.round(routeData.properties.duration / 60);
    const mockFare = Math.round(100 + parseFloat(distanceKm) * 15);
    
    // Mock historical data based on location pair
    const mockRides3Days = Math.floor(Math.random() * 150) + 20;
    const mockRidesWeek = Math.floor(mockRides3Days * 2.5);
    
    // Determine availability
    let availability = 'High';
    let alternativeSuggestion = null;
    
    if (mockRides3Days < 30) {
      availability = 'Low';
      alternativeSuggestion = 'Consider taking the Delhi Metro or bus. Public transport is more reliable on this route during peak hours.';
    } else if (mockRides3Days < 80) {
      availability = 'Medium';
    }
    
    return {
      predictedTime: `${durationMin} mins`,
      predictedFare: mockFare.toLocaleString('en-IN'),
      availability: availability,
      confidence: (Math.random() * 20 + 75).toFixed(1),
      ridesLast3Days: mockRides3Days,
      ridesLastWeek: mockRidesWeek,
      alternativeSuggestion: alternativeSuggestion
    };

    /* UNCOMMENT TO USE YOUR ACTUAL API:
    try {
      const response = await fetch('http://your-backend-api.com/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickup_location: pickup,
          dropoff_location: dropoff,
          date: date,
          time: time,
          pickup_coords: pickupCoords,
          dropoff_coords: dropoffCoords,
          distance: routeData.properties.distance,
          duration: routeData.properties.duration
        })
      });
      
      const data = await response.json();
      
      return {
        predictedTime: data.estimated_time,
        predictedFare: data.estimated_fare,
        availability: data.availability,
        confidence: data.confidence,
        ridesLast3Days: data.rides_last_3_days,
        ridesLastWeek: data.rides_last_week,
        alternativeSuggestion: data.alternative_suggestion || null
      };
    } catch (err) {
      throw new Error('Failed to get prediction from API');
    }
    */
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate different locations
      if (pickup === dropoff) {
        throw new Error('Pickup and dropoff locations must be different');
      }

      // Geocode both locations
      const pickupCoords = await geocodeLocation(pickup);
      const dropoffCoords = await geocodeLocation(dropoff);

      // Get route
      const route = await getRoute(pickupCoords, dropoffCoords);

      // Get prediction
      const prediction = await getPrediction(pickupCoords, dropoffCoords, route);

      // Update parent state with all data
      setPredictionResult({
        predictedTime: prediction.predictedTime,
        predictedFare: prediction.predictedFare,
        availability: prediction.availability,
        confidence: prediction.confidence,
        ridesLast3Days: prediction.ridesLast3Days,
        ridesLastWeek: prediction.ridesLastWeek,
        alternativeSuggestion: prediction.alternativeSuggestion,
        route: route,
        pickup: pickupCoords,
        dropoff: dropoffCoords
      });

    } catch (err) {
      setError(err.message || 'Failed to process request. Please try again.');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-panel" style={{ position: 'relative' }}>
      {error && (
        <div style={{
          background: '#ff4444',
          color: '#fff',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '15px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <div className="input-group" style={{ position: 'relative', zIndex: 2 }}>
        <label htmlFor="pickup-location">Pickup Location</label>
        <div className="input-with-icon">
          <select
            id="pickup-location"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            required
          >
            {LOCATIONS_IN_DELHI.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <FaLocationArrow className="input-icon" />
        </div>
      </div>

      <div className="input-group" style={{ position: 'relative', zIndex: 2 }}>
        <label htmlFor="dropoff-location">Dropoff Location</label>
        <div className="input-with-icon">
          <select
            id="dropoff-location"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            required
          >
            {LOCATIONS_IN_DELHI.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <FaMapPin className="input-icon" />
        </div>
      </div>

      <div className="datetime-group" style={{ position: 'relative', zIndex: 2 }}>
        <div className="input-group">
          <label htmlFor="ride-date">Date</label>
          <div className="input-with-icon">
            <input
              type="date"
              id="ride-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <FaCalendarAlt className="input-icon" />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="ride-time">Time</label>
          <div className="input-with-icon">
            <input
              type="time"
              id="ride-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <FaClock className="input-icon" />
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        className="btn-submit"
        onClick={handleSubmit}
        disabled={loading}
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Processing...' : 'Check Reliability'}
      </button>
    </div>
  );
};

export default MagicBookingPanel;