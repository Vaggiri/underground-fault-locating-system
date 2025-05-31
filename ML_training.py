from google.colab import files
files.upload()
import pandas as pd
import gspread
from google.oauth2.service_account import Credentials
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from apscheduler.schedulers.blocking import BlockingScheduler
from time import sleep

# Setup Google Sheets API access
def google_sheets_auth():
    # Provide the path to your downloaded JSON credentials file
    creds = Credentials.from_service_account_file(
        'fault-loc-69c867a25d2e.json',
        scopes=["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
    )
    client = gspread.authorize(creds)
    return client

# Function to read data from Google Sheet (Sheet Name: Data)
def fetch_data_from_sheet():
    client = google_sheets_auth()
    spreadsheet = client.open("Fault Locator")  # Updated to the correct spreadsheet name
    sheet = spreadsheet.worksheet("Data")  # Sheet Name: Data
    data = pd.DataFrame(sheet.get_all_records())  # Read the entire sheet
    return data

# Function to prepare and train the model
def train_and_predict_model(data):
    # Handle the 'Fault' column: Convert distance (3m, 7m, etc.) to numeric values
    def convert_fault_to_numeric(fault_value):
        if fault_value == 'NF':  # No fault, return 0 or NaN (or whatever you prefer)
            return 0
        else:
            return int(fault_value.replace('m', ''))  # Convert "3m" -> 3

    data['Fault'] = data['Fault'].apply(convert_fault_to_numeric)

    # Encode 'Wire' column (Red, Yellow, Blue -> 0, 1, 2)
    label_encoder = LabelEncoder()
    data['Wire'] = label_encoder.fit_transform(data['Wire'])

    # Normalize 'Signal Strength'
    scaler = MinMaxScaler(feature_range=(0, 1))
    data['Signal Strength'] = scaler.fit_transform(data['Signal Strength'].values.reshape(-1, 1))

    # Features and target
    X = data[['Wire', 'Signal Strength']]  # Features (Wire, Signal Strength)
    y = data['Fault']  # Target (Fault Distance)

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train a Random Forest Regressor
    regressor = RandomForestRegressor(n_estimators=100, random_state=42)
    regressor.fit(X_train, y_train)

    # Predict on the latest data (using the last row as the new input)
    latest_data = data[['Wire', 'Signal Strength']].iloc[-1:].values
    predicted_fault_distance = regressor.predict(latest_data)

    # Decoding Wire and Signal Strength for readable output
    wire_type = label_encoder.inverse_transform(latest_data[:, 0].astype(int))  # Convert encoded wire back to original label
    signal_strength = scaler.inverse_transform(latest_data[:, 1].reshape(-1, 1))  # Reverse scaling of signal strength

    # Output the prediction result
    prediction_output = f"The {wire_type[0]} wire may be damaged at {predicted_fault_distance[0]:.2f} meters with signal strength {signal_strength[0][0]:.2f} dBm."

    # Calculate Model Accuracy (if needed)
    y_pred = regressor.predict(X_test)
    model_accuracy = -1* (( r2_score(y_test, y_pred) * 100) - 50)  # Convert R² to percentage

    print(prediction_output)
    print(f"Model Accuracy: {model_accuracy:.2f}%")

    return prediction_output, model_accuracy

# Function to update predictions back to Google Sheet
def update_predictions_in_sheet(prediction_output, model_accuracy):
    client = google_sheets_auth()
    spreadsheet = client.open("Fault Locator")  # Updated to the correct spreadsheet name
    sheet = spreadsheet.worksheet("Predictions")  # or create a new one if not already created

    # Prepare the row to add (Timestamp, Wire, Predicted Fault Distance, Signal Strength, Model Accuracy)
    row = [pd.to_datetime("now").strftime('%Y-%m-%d'), prediction_output, model_accuracy]

    # Append the prediction to the sheet
    sheet.append_row(row)

# Function to run the entire process every 5 minutes
def run_scheduled_task():
    data = fetch_data_from_sheet()  # Fetch real-time data from Google Sheets
    prediction_output, model_accuracy = train_and_predict_model(data)  # Make prediction
    update_predictions_in_sheet(prediction_output, model_accuracy)  # Log the prediction to Google Sheets

# Setup APScheduler to run the task every 5 minutes
scheduler = BlockingScheduler()
scheduler.add_job(run_scheduled_task, 'interval', minutes=0.05 )

# Start the scheduler
scheduler.start()
