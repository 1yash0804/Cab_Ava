import pandas as pd
import numpy as np
import random
from math import radians, sin, cos, sqrt, asin

print("Generating 50,000 synthetic bookings for Delhi...")
print("This may take 10-20 seconds. Please wait...")

# --- 1. Haversine function to calculate distance ---
def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points 
    on the Earth (specified in decimal degrees).
    """
    # convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    
    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371 # Radius of Earth in kilometers.
    return c * r

# --- 2. List of 50+ locations in Delhi with (lat, lon) ---
LOCATIONS_IN_DELHI = {
    "Indira Gandhi International Airport (T3)": (28.5562, 77.1000),
    "New Delhi Railway Station": (28.6428, 77.2219),
    "Connaught Place": (28.6330, 77.2197),
    "India Gate": (28.6129, 77.2295),
    "Red Fort": (28.6562, 77.2410),
    "Qutub Minar": (28.5245, 77.1855),
    "Hauz Khas Village": (28.5501, 77.1959),
    "Chandni Chowk": (28.6507, 77.2307),
    "Saket (Select Citywalk Mall)": (28.5285, 77.2190),
    "Vasant Kunj (DLF Emporio)": (28.5393, 77.1517),
    "Karol Bagh Market": (28.6500, 77.1900),
    "Lajpat Nagar Central Market": (28.5680, 77.2425),
    "Nehru Place": (28.5492, 77.2500),
    "IIT Delhi": (28.5450, 77.1926),
    "Delhi University (North Campus)": (28.6887, 77.2069),
    "AIIMS": (28.5651, 77.2076),
    "Gurgaon (Cyber Hub)": (28.4940, 77.0877),
    "Noida (Sector 18)": (28.5700, 77.3240),
    "Akshardham Temple": (28.6127, 77.2773),
    "Lotus Temple": (28.5535, 77.2588),
    "JNU": (28.5683, 77.1672),
    "Dwarka (Sector 21 Metro)": (28.5520, 77.0601),
    "Anand Vihar ISBT": (28.6473, 77.3150),
    "Kashmere Gate ISBT": (28.6670, 77.2300),
    "Sarojini Nagar Market": (28.5802, 77.2010),
    "Khan Market": (28.6000, 77.2270),
    "Humayun's Tomb": (28.5933, 77.2507),
    "Lodhi Garden": (28.5930, 77.2196),
    "Rajiv Chowk Metro": (28.6330, 77.2197),
    "Mandi House": (28.6276, 77.2359),
    "Pragati Maidan": (28.6152, 77.2435),
    "Chanakyapuri (Diplomatic Enclave)": (28.5975, 77.1819),
    "Paharganj": (28.6438, 77.2131),
    "Mayur Vihar Phase 1": (28.6074, 77.2882),
    "Rohini (Sector 18)": (28.7188, 77.1084),
    "Pitampura (TV Tower)": (28.6942, 77.1524),
    "Janakpuri (District Centre)": (28.6250, 77.0750),
    "Uttam Nagar": (28.6186, 77.0549),
    "Greater Kailash (M-Block Market)": (28.5480, 77.2384),
    "South Extension": (28.5680, 77.2210),
    "INA Market": (28.5755, 77.2144),
    "CR Park": (28.5392, 77.2494),
    "Malviya Nagar": (28.5340, 77.2084),
    "Okhla Industrial Area": (28.5330, 77.2840),
    "Patel Nagar": (28.6440, 77.1700),
    "Laxmi Nagar": (28.6310, 77.2740),
    "Civil Lines": (28.6817, 77.2230),
    "Model Town": (28.7118, 77.1901),
    "Shahdara": (28.6980, 77.2860),
    "Mehrauli": (28.5190, 77.1780),
    "Ghaziabad (Kaushambi Metro)": (28.6430, 77.3220)
}

data = []
N = 50000  # 50,000 data points
location_names = list(LOCATIONS_IN_DELHI.keys())

for _ in range(N):
    hour = random.randint(0, 23)
    day_of_week = random.randint(0, 6)
    month = random.randint(1, 12)
    
    # --- 3. Pick random locations and calculate new features ---
    pickup_name = random.choice(location_names)
    drop_name = random.choice(location_names)
    
    # Ensure pickup and drop are not the same
    while pickup_name == drop_name:
        drop_name = random.choice(location_names)
        
    pickup_coords = LOCATIONS_IN_DELHI[pickup_name]
    drop_coords = LOCATIONS_IN_DELHI[drop_name]
    
    # NEW FEATURE: Trip Distance
    trip_distance_km = haversine(pickup_coords[0], pickup_coords[1], drop_coords[0], drop_coords[1])
    
    # NEW FEATURE: Is it an airport trip? (very important)
    is_airport_trip = 1 if "Airport" in pickup_name or "Airport" in drop_name else 0

    # Simulate other features
    drivers_nearby = random.randint(0, 20)
    local_demand_score = np.random.rand()
    is_raining = 1 if np.random.rand() > 0.8 else 0
    lead_time_minutes = random.choice([15, 30, 45, 60, 120])
    
    # --- 4. Generate the target label (p_success) ---
    base_success = 0.90
    
    # Penalties
    if hour >= 7 and hour <= 10: base_success -= 0.1  # Morning rush
    if hour >= 17 and hour <= 20: base_success -= 0.1 # Evening rush
    if is_raining: base_success -= 0.3
    if drivers_nearby < 3: base_success -= 0.3 # Harsher penalty
    if local_demand_score > 0.8: base_success -= 0.2
    
    if trip_distance_km > 25: base_success -= 0.15 # Long trips are harder
    if is_airport_trip and lead_time_minutes < 60: base_success -= 0.2 # Last-minute airport trips fail
    
    p_success = base_success + np.random.normal(0, 0.1)
    p_success = max(0, min(1, p_success))
    
    label_assigned = 1 if p_success > 0.6 else 0

    data.append({
        "hour_of_day": hour,
        "day_of_week": day_of_week,
        "month": month,
        "drivers_nearby": drivers_nearby,
        "local_demand_score": local_demand_score,
        "is_raining": is_raining,
        "lead_time_minutes": lead_time_minutes,
        "trip_distance_km": trip_distance_km,
        "is_airport_trip": is_airport_trip,
        "label_assigned": label_assigned
    })

df = pd.DataFrame(data)
df.to_csv("bookings.csv", index=False)

print(f"Successfully generated bookings.csv with {N} Delhi rows.")