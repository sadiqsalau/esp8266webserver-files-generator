/*
This is a generated header file

It contains CPP Declaration for all web files
Do not forget to collect the "Range" header e.g server.collectHeaders("Range", ...)

Instantiate the WebFilesContainer with your ESP8266WebServer instance e.g WebFilesContainer filesContainer(server);
*/
#ifndef WEBFILES_H
#define WEBFILES_H




const size_t WEBFILES_TOTAL_COUNT PROGMEM = {{WEBFILES_TOTAL_COUNT}};

{{FILES}}


const char* const   WEBFILES_FILENAME[] PROGMEM = {{{ALL_NAMES_DECLARATION}}};
const char* const   WEBFILES_DATA[] PROGMEM = {{{ALL_DATA_DECLARATION}}};
const char* const   WEBFILES_MIME[] PROGMEM = {{{ALL_MIME_DECLARATION}}};
const size_t        WEBFILES_SIZE[] PROGMEM = {{{ALL_SIZE_DECLARATION}}};


struct WebFile {
    const char* name;
    const char* data;
    const char* mime;
    size_t size;
};


class WebFilesContainer
{
private:
    ESP8266WebServer& _server;
    
    void _sendRangeError()
    {
        return this->_server.send(416, "text/plain", "Unable to handle request!");
    }

    void _servePartialContent(WebFile* file)
    {
        String  rangeHeader = this->_server.header("Range");
                rangeHeader.trim();
                
        int     equalSignIndex = rangeHeader.indexOf("=");
        String  rangeUnit = rangeHeader.substring(0, equalSignIndex);

        if(!rangeUnit.equals("bytes"))
        {
            return this->_sendRangeError();
        }
        
        
        String  rangeValue = rangeHeader.substring(equalSignIndex + 1);
                rangeValue.trim();


        if(rangeValue.indexOf(",") > -1)
        {
            return this->_sendRangeError();
        }
        
        
        int dashSignIndex = rangeValue.indexOf("-");
        if(dashSignIndex == -1){
            return this->_sendRangeError();
        }
        
        
        
        
        String  startPosString = rangeValue.substring(0, dashSignIndex);
        String  endPosString = rangeValue.substring(dashSignIndex + 1);

        
        int finalEnd = file->size - 1;
        int     startPos = 0;
        int     endPos = finalEnd;
        
        
        // E.g bytes=-10 ===> Last ten bytes
        if(dashSignIndex==0)
        {
            startPos=finalEnd - (endPosString.toInt() - 1);
        }
        else {
            startPos=startPosString.toInt();
            
            if(endPosString.length())
            {
                endPos=endPosString.toInt();
            }
        }
        
        if(
            startPos < 0 || startPos > finalEnd || 
            endPos < startPos || endPos > finalEnd
        )
        {
            return this->_sendRangeError();
        }


        String contentRange="bytes ";
        contentRange += startPos;
        contentRange += "-";
        contentRange += endPos;
        contentRange += "/";
        contentRange += file->size;


        int contentLength = (endPos - startPos) + 1;
        const char* streamBeginning = file->data + startPos;


        this->_server.sendHeader("Content-Range", contentRange);
        this->_server.send(206, file->mime, streamBeginning, contentLength);
    }


    void _serveWebFiles()
    {
        return this->sendWebFile(
            this->getWebFile( this->_server.urlDecode(this->_server.uri()).c_str() )
        );
    }

    void _send404()
    {
        return this->_server.send(404, "text/plain", "404 - Not found!");   
    }

public:
    WebFilesContainer(ESP8266WebServer& server): _server{server}{};
    
    static WebFile* getWebFile(const char* filename)
    {
        WebFile* res=nullptr;
        
        for(int i=0; i<WEBFILES_TOTAL_COUNT; i++)
        {
            if(String(WEBFILES_FILENAME[i]).equals(filename))
            {

                res=new WebFile;
                res->name=WEBFILES_FILENAME[i];
                res->data=WEBFILES_DATA[i];
                res->mime=WEBFILES_MIME[i];
                res->size=WEBFILES_SIZE[i];
                break;
            }
        }

        return res;
    }
    
    

    
    
    void sendWebFile(WebFile* file)
    {
        if(nullptr == file)
        {
            return this->_send404();
        }
        
        
        this->_server.sendHeader("Accept-Range", "bytes");
        this->_server.sendHeader("Cache-Control", "max-age=3600");
        

        if(this->_server.hasHeader("Range"))
        {
            this->_servePartialContent(file);
        }
        else {
            this->_server.send(200, file->mime, file->data, file->size);
        }

    }

    void setup()
    {
        this->_server.collectHeaders("Range");
        this->_server.onNotFound([this]{ this->_serveWebFiles(); });
    }
};



#endif