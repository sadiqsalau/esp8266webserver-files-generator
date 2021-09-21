#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include "WebFiles.h" // The generated WebFiles.h


#ifndef APSSID
#define APSSID "ESP-AP"
#define APPSK  "12345678"
#endif




/* Set these to your desired credentials. */
const char *ssid = APSSID;
const char *password = APPSK;

ESP8266WebServer server(80);
WebFilesContainer filesContainer(server);







// LED
bool IS_LED_ON = false;

void sendLEDStatus() { server.send(200, "text/plain", String(IS_LED_ON));}
void toggleLed(bool status)
{
  IS_LED_ON = status;
  sendLEDStatus(); 
}

void configureRESTfulRoutes()
{
  server.on("/api/on", []{ toggleLed(true); });
  server.on("/api/off", []{ toggleLed(false); });
  server.on("/api/status", sendLEDStatus);
}

// LED


void handleRoot() {
  filesContainer.sendWebFile( filesContainer.getWebFile("/index.html") );
}


void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  
  delay(1000);

  
  Serial.begin(115200);
  Serial.println();
  Serial.print("Configuring access point...");
  
  /* You can remove the password parameter if you want the AP to be open. */
  WiFi.softAP(ssid/* , password */);

  IPAddress myIP = WiFi.softAPIP();
  Serial.print("AP IP address: ");
  Serial.println(myIP);

  filesContainer.setup();

  server.on("/", handleRoot);

  // Api routes
  configureRESTfulRoutes();
  
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  digitalWrite(LED_BUILTIN, !IS_LED_ON);
  server.handleClient();
}