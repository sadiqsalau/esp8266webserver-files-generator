# ESP8266 WebServer Files Generator #

This is a small script that uses Node.js to generate a header file
that contains declaration of files stored into the PROGMEM
which can be imported into your Arduino ".ino" source code




Requirements

- Node.js installed



Once you have Node.js installed  you can run:

`npm run build` - To generate the Header File
`npm run watch` - To watch the public folder and automatically generate the Header File whenever you make changes inside the folder