const config = require("./config.json");
const fs = require('fs');

module.exports.getRewardDescription = function getRewardDescription(rewardAddress) {
    let desc = rewardLookup[rewardAddress];
    return desc ? desc : rewardAddress;
}

module.exports.getRpc = function getRpc(index) {
    return config.rpcs[index];
}

module.exports.displayTime = function displayTime(timestamp) {
    var a = new Date(timestamp * 1000);
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    return hour + ":" + min + ":" + sec;
}

module.exports.log = function log(mystring, isError)
{
    console.log(mystring);
    if (isError)
    {
        fs.appendFileSync("logs", (new Date()).toLocaleTimeString() + ": " + mystring+"\n");
    }
    
}

module.exports.intToInput = function intToInput(myint)
{
    return parseInt(myint).toString(16).padStart(64,"0");
}