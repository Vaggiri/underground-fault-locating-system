#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <ESP_Mail_Client.h>

const char* ssid = "Your_wifi_ssid";
const char* password = "Your_password";

const char* scriptURL = "https://script.google.com/macros/s/AKfycbzAtwlRRL5uWCn5sN3W68VAswuBVb_8RkaxV5EiDyLdKynsQFeImq6HLCoj2b5AXO0R/exec";

#define SMTP_HOST "smtp.gmail.com"
#define SMTP_PORT 465
#define AUTHOR_EMAIL "girirubiv2007@gmail.com"
#define AUTHOR_PASSWORD ""
#define RECIPIENT_EMAIL "girirubiv2007@gmail.com"

int sensorPin = 34;
#define RELAY_R 25
#define RELAY_Y 26
#define RELAY_B 27
#define BUZZER_PIN 32

bool signalAlertSent = false;

void setup() {
  Serial.begin(115200);

  pinMode(RELAY_R, OUTPUT);
  pinMode(RELAY_Y, OUTPUT);
  pinMode(RELAY_B, OUTPUT);
  pinMode(2, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWi-Fi connected");
}

void loop() {
  logAndAlert("R", RELAY_R, RELAY_Y, RELAY_B);
  delay(1000);
  logAndAlert("Y", RELAY_Y, RELAY_R, RELAY_B);
  delay(1000);
  logAndAlert("B", RELAY_B, RELAY_R, RELAY_Y);
  delay(10000);
}

void logAndAlert(String key, int active, int off1, int off2) {
  digitalWrite(active, LOW);
  digitalWrite(off1, HIGH);
  digitalWrite(off2, HIGH);
  delay(500);

  int value = analogRead(sensorPin) / 4;
  int rssi = WiFi.RSSI();
  String status = getFaultStatus(value);

  Serial.printf("%s: %s (%d), RSSI: %ld\n", key.c_str(), status.c_str(), value, rssi);

  DynamicJsonDocument doc(512);
  JsonObject obj = doc.createNestedObject(key);
  obj["status"] = status;
  obj["signal"] = rssi;
  String json;
  serializeJson(doc, json);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(scriptURL);
    http.addHeader("Content-Type", "application/json");
    int httpCode = http.POST(json);
    Serial.printf("Data sent to sheet, HTTP response: %d\n", httpCode);
    http.end();
  }

  if (status != "NF" && status != "Unknown") {
    String msg = "Alert: The " + key + " line is damaged at " + status + ".\n\nView dashboard: https://681b6e62bf287a0939e648d5--idyllic-profiterole-a8019c.netlify.app/";
    soundBuzzer();
    sendEmailAlert(msg);
  }

  if (rssi < -75 && !signalAlertSent) {
    String msg = "Warning: Weak Wi-Fi signal detected (" + String(rssi) + " dBm).\n\nView dashboard: https://681b6e62bf287a0939e648d5--idyllic-profiterole-a8019c.netlify.app/";
    soundBuzzer();
    sendEmailAlert(msg);
    signalAlertSent = true;
  } else if (rssi >= -75) {
    signalAlertSent = false;
  }
}

String getFaultStatus(int value) {
  if (value >= 1000) return "NF";
  if (value >= 500 && value < 660) return "3m";
  if (value >= 660 && value < 795) return "7m";
  if (value >= 795 && value < 870) return "10m";
  if (value >= 870 && value <= 920) return "15m";
  return "Unknown";
}

void sendEmailAlert(String body) {
  SMTPSession smtp;
  SMTP_Message message;

  ESP_Mail_Session session;
  session.server.host_name = SMTP_HOST;
  session.server.port = SMTP_PORT;
  session.login.email = AUTHOR_EMAIL;
  session.login.password = AUTHOR_PASSWORD;
  session.login.user_domain = "";

  message.sender.name = "ESP32 Fault Alert";
  message.sender.email = AUTHOR_EMAIL;
  message.subject = "Cable Fault Alert";
  message.addRecipient("Admin", RECIPIENT_EMAIL);
  message.text.content = body.c_str();
  message.text.charSet = "utf-8";
  message.text.transfer_encoding = Content_Transfer_Encoding::enc_7bit;

  smtp.debug(1);

  if (!smtp.connect(&session)) {
    Serial.println("SMTP connection failed.");
    return;
  }

  if (!MailClient.sendMail(&smtp, &message)) {
    Serial.printf("Email failed to send: %s\n", smtp.errorReason().c_str());
  } else {
    Serial.println("Email sent successfully.");
  }

  smtp.closeSession();
}

void soundBuzzer() {
  for (int i = 0; i < 50; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
}