#ifndef WEBFILES_H
#define WEBFILES_H

{{FILES_LIST}}

void sendWebFile(ESP8266WebServer &server, const char *data, char *mime, size_t length)
{
    server.send(200, mime, data, length);
}

void configureWebFilesList(ESP8266WebServer &server)
{

{{SERVER_CONFIG}}

}

#endif