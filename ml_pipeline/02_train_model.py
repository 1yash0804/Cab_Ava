import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, brier_score_loss, classification_report
import warnings

# Ignore warnings for a cleaner output
warnings.filterwarnings('ignore')

print("Loading 50,000 row data from bookings.csv...")
df = pd.read_csv("bookings.csv")

# --- Define Features ---
# This list MUST match the columns you created in the last step
FEATURES = [
    "hour_of_day", 
    "day_of_week", 
    "month", 
    "drivers_nearby", 
    "local_demand_score",
    "is_raining", 
    "lead_time_minutes",
    "trip_distance_km",  # Your new feature
    "is_airport_trip"    # Your new feature
]
TARGET = "label_assigned"

X = df[FEATURES]
y = df[TARGET]

# Split data into 80% for training, 20% for testing
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training XGBoost model...")
# We use 'binary:logistic' to get a probability (0.0 to 1.0)
model = xgb.XGBClassifier(
    objective='binary:logistic',
    eval_metric='logloss',
    use_label_encoder=False,
    n_estimators=100,
    learning_rate=0.1,
    max_depth=5  # A slighly deeper tree for more features
)

# This is where the model "learns"
model.fit(X_train, y_train)

print("\n--- Model Evaluation ---")
# --- Evaluate the model ---
preds_proba = model.predict_proba(X_test)[:, 1] # Get p_success
preds_label = model.predict(X_test)

acc = accuracy_score(y_test, preds_label)
brier = brier_score_loss(y_test, preds_proba)

print(f"  Accuracy: {acc:.4f}")
print(f"  Brier Score (lower is better): {brier:.4f}")
print("\nClassification Report:")
print(classification_report(y_test, preds_label))

# --- Save the "Brain" ---
model_filename = "xgboost_model.json"
model.save_model(model_filename)
print(f"\nModel saved successfully as '{model_filename}'")