/**
 * Modules and Imports
 */
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');
const config = require('./config'); // The config file
const MIME_DB = require('./assets/mime-db.json'); // The MIME DB


module.exports = generateHeaderFile;

function generateHeaderFile()
{
    console.log("<<===========Generating Header File===========>>");

    const files = getWebFilesList();

    const CPP_Files = files.map(function (file) {
        return `//==>    /${file.name}\n${file.CPPNameDec}\n${file.CPPMIMEDec}\n${file.CPPDataDec}`;
    });
    const headerSource = 
        fs.readFileSync(config.HEADER_TEMPLATE)
        .toString()
        .replace('{{WEBFILES_TOTAL_COUNT}}', files.length)
        .replace('{{FILES}}', CPP_Files.join('\n\n'))
        .replace('{{ALL_NAMES_DECLARATION}}', extractCPPAllNamesDeclaration(files))
        .replace('{{ALL_DATA_DECLARATION}}', extractCPPAllDataDeclaration(files))
        .replace('{{ALL_MIME_DECLARATION}}', extractCPPAllMIMEDeclaration(files))
        .replace('{{ALL_SIZE_DECLARATION}}', extractCPPAllSizeDeclaration(files));
    

    fs.writeFileSync(config.HEADER_OUTPUT, headerSource);

}


function extractProp(list, prop)
{
    return list.map(function (v) {
        return v[prop];
    });
}

function extractAllCPPPointers(list, title)
{
    const entries = extractProp(list, 'variableName').map(function (v) {
        return `\t${v}_${title}`;
    });

    return `\n${entries.join(',\n')}\n`;
}

function extractCPPAllMIMEDeclaration   (files) { return extractAllCPPPointers(files, 'MIME'); }
function extractCPPAllDataDeclaration   (files) { return extractAllCPPPointers(files, 'DATA'); }
function extractCPPAllNamesDeclaration  (files) { return extractAllCPPPointers(files, 'NAME'); }

function extractCPPAllSizeDeclaration(files) {
    const entries = extractProp(files, 'variableName').map(function(variableName){
        return `\tsizeof(${variableName}_DATA)`;
    }).join(',\n');

    return `\n${entries}\n`;
}

/**
 * 
 * @param {String} base - The base dir to scan
 * @return Array
 */
function getWebFilesList(base='')
{
    const list = [];
    const dirHandle = fs.opendirSync(
        path.join(config.WEB_PATH, base)
    );

    
    let entry;
    while(entry = dirHandle.readSync())
    {
        const entrypath = path.join(base, entry.name).replaceAll(path.sep, '/');
        
        // Check if it is a directory
        if(entry.isDirectory())
        {
            // Add the the contents of the entry
            list.push(
                ...getWebFilesList(entrypath)
            );
        }
        else {
            console.log("/" + entrypath);
            
            const variableName = getCPPVariableName(entrypath); // The CPP Variable name
            const mime = getMIME(entrypath); // Entry MIME type
            const hexlist = bufferToArrayOfHexString( // Convert the buffer to an array of hex string 
                fs.readFileSync(path.join(config.WEB_PATH, entrypath)) // Read the file
            );

            list.push({
                name: entrypath.replaceAll("\"", "\\\""), //Replace " with \"
                variableName,
                CPPNameDec: getCPPFilenameDeclaration(variableName, entrypath),
                CPPDataDec: getCPPDataDeclaration(variableName, hexlist),
                CPPMIMEDec: getCPPMIMEDeclaration(variableName, mime)
            });
        }
    }

    dirHandle.closeSync();

    return list;
}



function getCPPMIMEDeclaration(variableName, mime){ return `const char ${variableName}_MIME[] PROGMEM = "${mime}";`; }
function getCPPDataDeclaration(variableName, hexlist){ return `const char ${variableName}_DATA[] PROGMEM = {${hexlist.join(',')}};`; }
function getCPPFilenameDeclaration(variableName, path){ return `const char ${variableName}_NAME[] PROGMEM = "/${path}";`; }



/**
 * Returns a CPP Valid variable name by 
 * hashing the file path
 * @param {String} path - The file path
 * @returns String 
 */
function getCPPVariableName(path)
{
    return `WEBFILE_${
        crypto.createHash('md5').update(path).digest('hex')
        .toUpperCase()
    }`;
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
    
    const found = Object.entries(MIME_DB).find(function([mime, data]){
        return data.extensions?.includes(ext);
    });

    return found ? found[0] : "application/octet-stream";
}

/**
 * Returns an array of Hex strings
 * @param {Buffer} buffer - The buffer to convert
 * @returns Array - Array of HEX with the format 0xFF
 */
function bufferToArrayOfHexString(buffer)
{   
    return Object.values(buffer).map(function(v){
        return `0x${v.toString('16')}`;
    });
}
