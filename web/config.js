const path = require('path');
module.exports = {
    WEB_PATH:           path.join(__dirname, 'public'), // The web directory
    HEADER_TEMPLATE:    path.join(__dirname, "WebFiles.example.h"), // The header template
    HEADER_OUTPUT:      path.join(__dirname, "../WebFiles.h"), // The header output path
    /**
     * Replace requests to e.g /home to /home/index.html if /home/index.html exists 
     */
    USE_INDEX_HTML_FOR_DIR: true
};