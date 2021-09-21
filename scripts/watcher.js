const fs = require('fs');
const config = require('./config')
const generateHeaderFile = require('./generate');

console.log("<<=======Watching Web Dir=======>>");
console.log(config.WEB_PATH);
console.log("<<==============================>>");

fs.watch(config.WEB_PATH, {recursive: true}, function(eventType, filename){
    console.log(eventType);
    generateHeaderFile();
});