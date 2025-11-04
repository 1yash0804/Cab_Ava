from fastapi import FastAPI
from pydantic import BaseModel
import xgboost as xgb
import pandas as pd
import os

app = FastAPI(title="Availability Intelligence Layer (AIL)")

# --- 1. Load the "Brain" ---
MODEL_FILE = "../ml_pipeline/xgboost_model.json"
if not os.path.exists(MODEL_FILE):
    raise RuntimeError(f"Model file not found at {MODEL_FILE}. Run the ml_pipeline first!")

model = xgb.XGBClassifier()
model.load_model(MODEL_FILE)

print("AIL Backend: Model loaded successfully.")


# --- 1.5. DEFINE FEATURE ORDER (THE FIX) ---
# This list MUST exactly match the order from 02_train_model.py
TRAINING_FEATURES = [
    "hour_of_day", 
    "day_of_week", 
    "month", 
    "drivers_nearby", 
    "local_demand_score",
    "is_raining", 
    "lead_time_minutes",
    "trip_distance_km",
    "is_airport_trip"
]

# --- 2. Define the *Input* Data ---
class BookingRequest(BaseModel):
    hour_of_day: int
    day_of_week: int
    month: int
    lead_time_minutes: int
    trip_distance_km: float
    is_airport_trip: int
    drivers_nearby: int
    local_demand_score: float
    is_raining: int

# --- 3. Define the *Output* Data ---
class PredictionResponse(BaseModel):
    p_success: float
    reliability_bucket: str
    top_reasons: list[str]

# --- 4. Create the API Endpoint ---
@app.post("/v1/predict/booking_success", response_model=PredictionResponse)
def predict_booking_success(request: BookingRequest):
    
    # 1. Create a DataFrame from the request
    #    (Pydantic v2 uses .model_dump() instead of .dict())
    features_data = request.model_dump() 
    features_df = pd.DataFrame([features_data]) 
    
    # 2. RE-ORDER THE COLUMNS (THE FIX)
    #    This ensures the DataFrame columns are in the exact order the model expects
    features_df_ordered = features_df[TRAINING_FEATURES]

    # 3. Get prediction (probability of class "1")
    #    Use the *ordered* DataFrame
    p_success = model.predict_proba(features_df_ordered)[0][1]
    p_success = float(p_success)

    # 4. Business Logic: Define reliability bucket
    if p_success >= 0.8:
        bucket = "High"
    elif p_success >= 0.5:
        bucket = "Medium"
    else:
        bucket = "Low"

    # 5. Mock Explainability
    reasons = []
    if request.is_raining:
        reasons.append("heavy_rain_reported")
    if request.drivers_nearby < 5:
        reasons.append("low_driver_density")
    if request.trip_distance_km > 25:
        reasons.append("long_trip_distance")
    if request.is_airport_trip and p_success < 0.7:
        reasons.append("high_demand_airport_route")

    return {
        "p_success": p_success,
        "reliability_bucket": bucket,
        "top_reasons": reasons
    }

@app.get("/")
def root():
    return {"message": "AIL Service is running."}