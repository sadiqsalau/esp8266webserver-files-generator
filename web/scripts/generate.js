/**
 * Modules and Imports
 */
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const config = require('../config'); // The config file
const MIME_DB = require('../mime-db.json'); // The MIME DB


module.exports = generateHeaderFile;

function generateHeaderFile()
{
    console.log("================Generating Header File================");
    const sourceList = [];
    const configList = [];
    
    getWebFilesList(sourceList, configList);

    const headerSource = 
        fs.readFileSync(config.HEADER_TEMPLATE)
        .toString()
        .replace('{{FILES_LIST}}', sourceList.join('\n'))
        .replace('{{SERVER_CONFIG}}', configList.join('\n'));

    

    fs.writeFileSync(config.HEADER_OUTPUT, headerSource);

    console.log("================Generated Header File================");
}

/**
 * 
 * @param {Array} sourceList - The array to push the CPP variable declarations
 * @param {Array} configList - The array to push the CPP server config codes
 * @param {String} base - The base dir to scan
 */
function getWebFilesList(sourceList, configList, base='')
{
    const dirHandle = fs.opendirSync(
        path.join(config.WEB_PATH, base)
    );

    
    let entry;
    while(entry = dirHandle.readSync())
    {
        const entrypath = path.join(base, entry.name).replace(path.sep, '/');
        
        // Check if it is a directory
        if(entry.isDirectory())
        {
            // Add the the contents of the entry
            getWebFilesList(sourceList, configList, entrypath);
        }
        else {
            const variableName = getCPPVariableName(entrypath); // The CPP Variable name
            const mime = getMIME(entrypath); // Entry MIME type
            const hexlist = bufferToArrayOfHexString( // Convert the buffer to an array of hex string 
                fs.readFileSync(path.join(config.WEB_PATH, entrypath)) // Read the file
            );

            sourceList.push(
                getCPPDeclaration(variableName, hexlist)
            );

            configList.push(
                getCPPServerConfig(entrypath, variableName, mime)
            );

            // Checks if the entry is named "index.html"
            if("index.html" == entry.name && (base=='' || config.USE_INDEX_HTML_FOR_DIR))
            {
                configList.push(
                    getCPPServerConfig(base, variableName, mime)
                );
            }
        }
    }

    dirHandle.closeSync();
}



function getCPPDeclaration(variableName, hexlist)
{
    return `const char ${variableName}[] PROGMEM = {${hexlist.join(',')}};`;
}

/**
 * Returns a CPP Valid variable by replacing any character that is not a number,
 * capital or small alphabets with underscore
 * @param {String} path - The file path
 * @returns String 
 */
function getCPPVariableName(path)
{
    return `webfile_${crypto.createHash('sha1').update(path).digest('hex')}`;
}

/**
 * Returns the CPP Code for configuring the server to respond to a request
 * @param {String} path - The request path
 * @param {String} variableName - The CPP Variable name
 * @param {String} mime - The MIME to be sent to the client
 * @returns String
 */
function getCPPServerConfig(path, variableName, mime)
{
    return `server.on("/${path}", [&server]{ sendWebFile(server, ${variableName}, "${mime}", sizeof(${variableName})); });`;
}




function getMIME(filepath)
{
    /**
     * Get the extension of the filepath by
     * using the "extname" function from the
     * path module and removing "." from what
     * the function returns
     */
    const ext = path.extname(filepath).replace('.', '');
    
    let res;

    for(const [mime, data] of Object.entries(MIME_DB))
    {
        // Check if the filepath extension is 
        // included in the list of extensions for that mime
        if(data.extensions?.includes(ext))
        {
            res = mime;
            break;
        }
    }

    return res;
}

/**
 * Returns an array of Hex strings
 * @param {Buffer} buffer - The buffer to convert
 * @returns Array - Array of HEX with the format 0xFF
 */
function bufferToArrayOfHexString(buffer)
{
    const hexlist = [];

    for(const v of buffer)
    {
        hexlist.push(`0x${v.toString('16')}`);
    }

    return hexlist;
}
