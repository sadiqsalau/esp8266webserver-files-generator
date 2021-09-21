const path = require('path');
module.exports = {
    WEB_PATH:           path.join(__dirname, '../public'), // The web directory
    HEADER_OUTPUT:      path.join(__dirname, "../WebFiles.h"), // The header output path
    HEADER_TEMPLATE:    path.join(__dirname, "assets/WebFiles.example.h"), // The header template
};