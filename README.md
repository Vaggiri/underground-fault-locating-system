# ⚡ ESP32 Cable Fault Detection and Alert System

This project detects cable faults using an ESP32. It logs sensor data to Google Sheets and sends real-time email alerts when faults or weak Wi-Fi signals are detected. A buzzer provides local sound alerts.

---

## 📦 Features

- ✅ Detects cable faults at distances: 3m, 7m, 10m, 15m  
- 📈 Logs data to **Google Sheets** via Google Apps Script  
- 📧 Sends **email alerts** using Gmail SMTP  
- 🔊 Activates **buzzer** during alerts  
- 📶 Monitors **Wi-Fi signal strength (RSSI)** and alerts if signal is weak  
- 🔁 Switches between R, Y, and B lines automatically  

---

## 🛠️ Hardware Required

- ESP32 development board  
- Relay modules (x3) for R, Y, B phases  
- Analog cable fault sensor connected to GPIO 34  
- Buzzer  
- Jumper wires, breadboard  
- Wi-Fi connection  

---

## 🔌 Pin Configuration

| Component       | GPIO Pin |
|-----------------|----------|
| Analog Sensor   | 34       |
| Relay R         | 25       |
| Relay Y         | 26       |
| Relay B         | 27       |
| Buzzer          | 32       |
| LED (optional)  | 2        |

---

## 📶 Wi-Fi Setup

Update your credentials in the code:

```cpp
const char* ssid = "your_wifi_ssid";
const char* password = "your_wifi_password";
```

---

## 📊 Google Sheets Integration

1. Go to [Google Apps Script](https://script.google.com).
2. Paste this script:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  for (var key in data) {
    sheet.appendRow([new Date(), key, data[key].status, data[key].signal]);
  }
  return ContentService.createTextOutput("Success");
}
```

3. Click `Deploy > Manage Deployments > New Deployment`
   - Set `Execute as`: Me  
   - Set `Who has access`: Anyone
4. Copy the deployment URL and update your ESP32 code:

```cpp
const char* scriptURL = "https://script.google.com/macros/s/XXXXXX/exec";
```

---

## 📧 Email Alerts via Gmail

To send emails through Gmail SMTP:

1. Enable **2-Step Verification** on your Gmail account.  
2. Generate an **App Password** from Google account settings.  
3. Use this in your ESP32 code:

```cpp
#define AUTHOR_EMAIL "your_email@gmail.com"
#define AUTHOR_PASSWORD "your_app_password"
#define RECIPIENT_EMAIL "receiver_email@gmail.com"
```

---

## 📈 Fault Detection Logic

| Analog Range   | Detected Fault Distance |
|----------------|--------------------------|
| > 1000         | No Fault (NF)            |
| 500 - 660      | 3m                       |
| 660 - 795      | 7m                       |
| 795 - 870      | 10m                      |
| 870 - 920      | 15m                      |
| Others         | Unknown                  |

---

## 🧠 How It Works

1. Reads analog values from the cable using GPIO 34.  
2. Detects fault location using threshold ranges.  
3. Logs data and signal strength to Google Sheets.  
4. Sends email + triggers buzzer if:
   - A fault is detected  
   - Wi-Fi signal is below -75 dBm  

---

## 🌐 Live Dashboard (Optional)

You can include a dashboard in the alert email:

```
https://fault-locator.netlify.app/
```

> You can build dashboards with Netlify, Firebase, or ThingSpeak.

---

## 🧪 Testing

- Use **Serial Monitor** at `115200` baud.  
- Simulate analog values to test detection.  
- Check email + Google Sheets for alert and log confirmation.

---

## 🧰 Required Libraries

Install these libraries via Arduino Library Manager:

- `WiFi.h`  
- `HTTPClient.h`  
- `ArduinoJson`  
- [`ESP_Mail_Client`](https://github.com/mobizt/ESP-Mail-Client)

---

## 🔒 Security Tips

- Never upload code with real credentials to GitHub.  
- Use `.env`, `secrets.h`, or `.gitignore` to keep them hidden.

---

## 💡 Future Upgrades

- Add LCD/OLED display  
- Include real-time clock (RTC) for timestamp accuracy  
- Add Telegram/WhatsApp alert integration  
- Use GPS module for location-based fault tracking  

---

## 👨‍💻 Developer Info

**Made by:** Girisudhan V  
**Student @ Amrita Vishwa Vidhyapeetham**  
📧 [vagcreations2007@gmail.com](mailto:vagcreations2007@gmail.com)

---

> “Detect early, react instantly, protect lives and infrastructure.” 🚨
