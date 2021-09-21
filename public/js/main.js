var BULB_IMG = document.getElementById("bulb-img");
var LED_STATUS = null;

function turnLEDOn() { return axios.get('/api/on'); }
function turnLEDOff() { return axios.get('/api/off'); }
function getLEDStatus() { return axios.get('/api/status'); }
function setLEDStatus(data) {
    LED_STATUS = data.data;
    BULB_IMG.src = data.data==1 ? 'images/pic_bulbon.gif' : 'images/pic_bulboff.gif';
}

function toggleLED()
{
    return (!LED_STATUS ? turnLEDOn() : turnLEDOff()).then(setLEDStatus); 
}

getLEDStatus().then(function(data){
    setLEDStatus(data);
    document.body.classList.remove("preloading");
});