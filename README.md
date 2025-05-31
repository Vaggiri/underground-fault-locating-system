# ⚡ ESP32 Cable Fault Detection and Alert System

This project is designed to detect cable faults using an ESP32. It logs sensor data to a Google Sheet and sends real-time email alerts when faults or weak Wi-Fi signals are detected. A buzzer is also used for on-site alerts.

---

## 📦 Features

- ✅ Detects cable faults at specific distances: 3m, 7m, 10m, 15m
- 📈 Sends sensor data to **Google Sheets** via Google Apps Script
- 📧 Sends real-time **email alerts** using Gmail SMTP
- 🔊 Activates **buzzer** during alerts
- 📶 Monitors **Wi-Fi signal strength (RSSI)** and alerts on weak signal
- 🔁 Automatically switches between R, Y, B lines for monitoring

---

## 🛠️ Hardware Required

- ESP32 development board
- Relay modules (3x) - for R, Y, B lines
- Buzzer
- Analog sensor connected to GPIO 34
- Jumper wires, breadboard
- Wi-Fi with internet access

---

## 🔌 Pin Configuration

| Function        | GPIO Pin |
|-----------------|----------|
| Analog Sensor   | 34       |
| Relay R         | 25       |
| Relay Y         | 26       |
| Relay B         | 27       |
| Buzzer          | 32       |
| LED (Optional)  | 2        |

---

## 📶 Wi-Fi Setup

Replace these with your own Wi-Fi credentials:

```cpp
const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";

📊 Google Sheet Logging
Go to Google Apps Script.

Paste the following script:

javascript
Copy
Edit
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  for (var key in data) {
    sheet.appendRow([new Date(), key, data[key].status, data[key].signal]);
  }
  return ContentService.createTextOutput("Success");
}
Deploy > New Deployment > Web App:

Execute as: Me

Access: Anyone

Copy the web app URL and update it in your Arduino code:

cpp
Copy
Edit
const char* scriptURL = "https://script.google.com/macros/s/XXXXXX/exec";
📧 Email Alerts with Gmail
Set up Gmail SMTP:

Enable 2-Step Verification in Gmail

Create an App Password from your account settings

Use it in place of your actual password

#define AUTHOR_EMAIL "your_email@gmail.com"
#define AUTHOR_PASSWORD "your_app_password"
#define RECIPIENT_EMAIL "receiver_email@gmail.com"
📈 Fault Detection Logic
The fault is determined based on the sensor analog value:

Range	Fault Distance
> 1000	No Fault (NF)
500 - 660	3m
660 - 795	7m
795 - 870	10m
870 - 920	15m
Others	Unknown

🧠 Working Principle
The ESP32 reads analog data from each phase (R, Y, B).

Based on thresholds, the system identifies fault distance.

Sends fault data + Wi-Fi signal to Google Sheets.

Triggers buzzer + sends email if:

A fault is detected

Wi-Fi signal < -75 dBm

🌐 Live Dashboard (Optional)
The alert includes a link to view your dashboard:

cpp
Copy
Edit
https://681b6e62bf287a0939e648d5--idyllic-profiterole-a8019c.netlify.app/
Build your custom dashboard with platforms like Netlify, Firebase, or ThingSpeak.

🧪 Testing
Open Serial Monitor at 115200 baud to see live readings.

Test by triggering different analog values for fault detection.

Check your Gmail for alerts and Google Sheets for logs.

🧰 Libraries Used
Make sure to install the following libraries:

WiFi.h

HTTPClient.h

ArduinoJson

ESP_Mail_Client

🔒 Security Note
Never expose your actual email or password in public repos.

Use .env or a separate secrets.h and ignore in Git (.gitignore).

💡 Future Improvements
Add GUI interface for configuring thresholds

Use OLED/LCD display for live monitoring

Add Telegram or WhatsApp integration

Include GPS data for outdoor deployments

👨‍💻 Made By
Developed by Girisudhan V
Student @ Amrita University
📧 vagcreations2007@gmail.com

