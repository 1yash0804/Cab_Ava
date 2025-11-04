const express = require('express');
const cors = require('cors');
const axios = require('axios'); // This is used to call your Python API

const app = express();
app.use(express.json());
app.use(cors()); // This allows your React app to call this server

const PORT = 4000;
// This is the URL of your Python "brain" API (from Step 2)
const AIL_API_URL = 'http://127.0.0.1:8000/v1/predict/booking_success';

/**
 * This is the public API endpoint your React frontend will call.
 */
app.post('/api/check-reliability', async (req, res) => {
  console.log('Node Backend: Received reliability check from frontend...');

  // 1. Get data from the frontend
  const { from, to, time } = req.body;
  
  // 2. Create mock data to send to our Python "brain"
  //    (We use the new features our model expects)
  const reqTime = new Date(time);
  const mockFeatures = {
    hour_of_day: reqTime.getHours(),
    day_of_week: reqTime.getDay(),
    month: reqTime.getMonth() + 1,
    lead_time_minutes: 30, // Mock
    trip_distance_km: Math.random() * 30 + 2, // Mock a random distance
    is_airport_trip: (from.toLowerCase().includes("airport") || to.toLowerCase().includes("airport")) ? 1 : 0,
    drivers_nearby: Math.floor(Math.random() * 20),
    local_demand_score: Math.random(),
    is_raining: Math.random() > 0.8 ? 1 : 0, // 20% chance of rain
  };

  try {
    // 3. Call the Python AIL Microservice
    console.log('Node Backend: Calling Python AIL...');
    
    // We send our new features to the Python "brain"
    const ailResponse = await axios.post(AIL_API_URL, mockFeatures);
    
    // 4. Return the AIL's prediction straight to the frontend
    console.log('Node Backend: Returning AIL response to frontend.');
    res.json(ailResponse.data);

  } catch (error) {
    // This will catch errors if your Python server is turned off
    console.error('Node Backend: Error calling AIL service!', error.message);
    res.status(500).json({ error: 'Failed to get prediction from AIL.' });
  }
});

app.listen(PORT, () => {
  console.log(`Node.js App Backend (Front Office) listening on http://localhost:${PORT}`);
});